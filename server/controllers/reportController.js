const Report = require("../models/reportSchema");
const { StatusCodes } = require("http-status-codes");
const { BadRequest } = require("../errors/index");
const { link } = require("../routes/authRouter");
const User = require("../models/userSchema");
const AdminUser = require("../models/rolesSchema").AdminUser;
const NormalUser = require("../models/rolesSchema").NormalUser;
const { default: axios } = require("axios");
const checkAndAwardBadges = require("../utils/awardBadges");
const calculateXP = require("../utils/calculateXP");
const { handleBillboardCreation } = require("../utils/billBoardCreation");
const Billboard = require("../models/billboardSchema");
const recalculateCrowdConfidence = require("../utils/scoring");

// Admin can get all reports
const getAllReports = async (req, res) => {
  const { role } = req.user;
  const {
    violationType,
    status,
    startDate,
    endDate,
    verdict,
    location,
    page,
    limit = 10,
  } = req.query;

  // Restrict filters for NormalUser
  if (
    role === "NormalUser" &&
    (violationType || status || startDate || endDate || verdict || location)
  ) {
    throw new BadRequest("Normal users cannot filter reports.");
  }

  const query = {};

  // Apply filters only for Admin/Other roles
  if (role !== "NormalUser") {
    if (violationType) query.violationType = violationType;
    if (status) query.status = status;
    if (verdict) query["aiAnalysis.verdict"] = verdict;
    if (location) query.location = location;

    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = new Date(startDate);
      if (endDate) query.submittedAt.$lte = new Date(endDate);
    }
  }

  const totalReports = await Report.countDocuments(query);

  let reportsQuery = Report.find(query)
    .populate("reportedBy", "username email role")
    .sort({ submittedAt: -1 });

  // Apply pagination only if page is provided
  let pageNumber, pageSize;
  if (page) {
    pageNumber = parseInt(page, 10) || 1;
    pageSize = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;
    reportsQuery = reportsQuery.skip(skip).limit(pageSize);
  } else {
    // No page provided → return all
    pageNumber = 1;
    pageSize = totalReports;
  }

  const reports = await reportsQuery;

  return res.status(StatusCodes.OK).json({
    data: reports,
    total: totalReports,
    page: pageNumber,
    totalPages: page ? Math.ceil(totalReports / pageSize) : 1,
    message: "Reports retrieved successfully.",
  });
};
const createReport = async (req, res) => {
  const { id, role } = req.user;
  const {
    issueDescription,
    imageURL,
    annotatedURL,
    violationType,
    location,
    ...extraFields
  } = req.body;

  if (role === "AdminUser") {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Only Normal Users can create reports.",
    });
  }

  if (!location?.coordinates || location.coordinates.length !== 2) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Invalid location coordinates.",
    });
  }

  const [longitude, latitude] = location.coordinates;
  let newLocation = { ...location, address: "N/A", zone: "N/A" };

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
    const loc = await axios.get(url, {
      headers: { "User-Agent": "Billguard-Hackathon/2.0" },
    });
    newLocation.address = loc.data.display_name || "N/A";
    newLocation.zoneId = loc.data.osm_id || "N/A";
  } catch (err) {
    console.warn("Reverse geocoding failed:", err.message);
  }

  // Check required fields
  const requiredFields = {
    issueDescription,
    imageURL,
    annotatedURL,
    violationType,
    location: newLocation,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(
      ([_, value]) =>
        !value || (typeof value === "string" && value.trim() === "")
    )
    .map(([key]) => key);

  if (missingFields.length > 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  // Sanitize and create report
  const sanitizedReport = {
    issueDescription: issueDescription.trim(),
    imageURL: imageURL.trim(),
    annotatedURL: annotatedURL.trim(),
    violationType,
    location: newLocation,
    reportedBy: id,
    ...extraFields,
  };

  const report = await Report.create(sanitizedReport);
  await NormalUser.findByIdAndUpdate(id, { $inc: { reportsSubmitted: 1 } });
  const billboard = await handleBillboardCreation(report);
  report.billboard = billboard._id;
  await report.save();
  return res.status(StatusCodes.CREATED).json({
    data: report,
    message: "Report created successfully.",
  });
};

const updateReport = async (req, res) => {
  const { id, role } = req.user;
  const { reportId } = req.params;
  const fields = { ...req.body };

  // Fetch report and linked user
  let report = await Report.findById(reportId).populate("reportedBy");
  if (!report) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: `No report found with id: ${reportId}`,
    });
  }

  // Permission check
  if (report.reportedBy._id.toString() !== id && role !== "AdminUser") {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "You do not have permission to update this report.",
    });
  }

  const oldStatus = report.status;

  // Fetch linked billboard
  const billboard = await Billboard.findOne({ reports: report._id }).populate(
    "reports"
  );
  if (!billboard) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Linked billboard not found for this report.",
    });
  }

  // Admin-specific logic: verification
  if (
    role === "AdminUser" &&
    fields.status &&
    oldStatus === "pending" &&
    fields.status !== "pending"
  ) {
    fields.reviewedBy = id;
    fields.reviewedAt = new Date();
    if (fields.adminNotes) fields.adminNotes = fields.adminNotes.trim();

    // Update all reports linked to this billboard
    await Report.updateMany(
      { _id: { $in: billboard.reports } },
      {
        $set: {
          status: fields.status,
          reviewedBy: id,
          reviewedAt: new Date(),
          adminNotes: fields.adminNotes || "",
        },
      }
    );

    // Award XP for all users linked to these reports
    const reportsSorted = await Report.find({
      _id: { $in: billboard.reports },
    }).sort({ submittedAt: 1 });
    for (let i = 0; i < reportsSorted.length; i++) {
      const rDoc = reportsSorted[i];
      if (!rDoc) continue;
      let multiplier = 0.3;
      if (i === 0) multiplier = 1.0;
      else if (i === 1) multiplier = 0.7;
      else if (i === 2) multiplier = 0.5;

      const baseXP = ["verified_unauthorized", "verified_authorized"].includes(
        fields.status
      )
        ? calculateXP(rDoc)
        : 0;
      const newXP = Math.round(baseXP * multiplier);

      const xpDiff = newXP - (rDoc.xpAwarded || 0);
      if (xpDiff !== 0) {
        await NormalUser.findByIdAndUpdate(rDoc.reportedBy, {
          $inc: { xp: xpDiff },
        });
        rDoc.xpAwarded = newXP;
        await rDoc.save();
        await checkAndAwardBadges(rDoc.reportedBy, { report: rDoc });
      }
    }

    // Update billboard verification status
    billboard.verifiedStatus = fields.status;
    billboard.verifiedBy = id;
    billboard.verifiedAt = new Date();
    await billboard.save();

    billboard.crowdConfidence = await recalculateCrowdConfidence(billboard._id);
    await billboard.save();

    // Update admin stats
    if (
      fields.status === "verified_unauthorized" ||
      fields.status === "verified_authorized"
    ) {
      await AdminUser.findByIdAndUpdate(id, { $inc: { verifiedReports: 1 } });
      for (const rId of billboard.reports) {
        const rDoc = await Report.findById(rId);
        if (rDoc)
          await NormalUser.findByIdAndUpdate(rDoc.reportedBy, {
            $inc: { reportsVerified: 1 },
          });
      }
    } else if (fields.status === "rejected") {
      await AdminUser.findByIdAndUpdate(id, { $inc: { rejectedReports: 1 } });
    }
  }

  // Regular report update for user/admin (non-status fields)
  report = await Report.findByIdAndUpdate(
    reportId,
    { $set: fields },
    { new: true, runValidators: true }
  ).populate("reportedBy reviewedBy");

  // Update leaderboard positions
  const topUsers = await NormalUser.find({}).sort({ xp: -1 }).limit(5);
  for (let i = 0; i < topUsers.length; i++) {
    topUsers[i].leaderBoardPosition = i + 1;
    await topUsers[i].save();
  }

  return res.status(StatusCodes.OK).json({
    data: report,
    message: "Report updated successfully.",
  });
};

const getReportsByUser = async (req, res) => {
  const { userId } = req.params;
  const { role, id } = req.user;

  if (role === "NormalUser" && id !== userId) {
    throw new Unauthorized("You can only fetch your own reports.");
  }
  const {
    violationType,
    status,
    startDate,
    verdict,
    endDate,
    page = 1,
    limit = 10,
  } = req.query;

  const query = { reportedBy: userId };

  if (violationType) {
    query.violationType = violationType;
  }

  if (status) {
    query.status = status;
  }
  if (verdict) {
    query["aiAnalysis.verdict"] = verdict;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 10;
  const skip = (pageNumber - 1) * pageSize;

  const reports = await Report.find(query)
    .populate("reportedBy", "username email role")
    .sort({ submittedAt: -1 })
    .skip(skip)
    .limit(pageSize);

  const totalReports = await Report.countDocuments(query);

  res.status(StatusCodes.OK).json({
    data: reports,
    total: totalReports,
    page: pageNumber,
    totalPages: Math.ceil(totalReports / pageSize),
    message: "User reports fetched successfully.",
  });
};

const getReportById = async (req, res) => {
  const { reportId } = req.params;
  const { id: userId, role } = req.user;

  const report = await Report.findById(reportId)
    .populate("reportedBy", "username email role")
    .lean();

  if (!report) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: `No report found with id: ${reportId}`,
    });
  }

  const isOwner = report.reportedBy._id.toString() === userId;
  const isAdmin = role === "AdminUser";

  if (!isOwner && !isAdmin) {
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: "You do not have permission to view this report.",
    });
  }

  return res.status(StatusCodes.OK).json({
    data: report,
    message: "Report fetched successfully.",
  });
};

const voteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { voteType } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const report = await Report.findById(reportId).populate("billboard");
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (!Array.isArray(report.upvotes)) report.upvotes = [];
    if (!Array.isArray(report.downvotes)) report.downvotes = [];

    // Remove existing votes
    const hadUpvote = report.upvotes.some(
      (u) => u.toString() === userId.toString()
    );
    const hadDownvote = report.downvotes.some(
      (u) => u.toString() === userId.toString()
    );

    report.upvotes = report.upvotes.filter(
      (u) => u.toString() !== userId.toString()
    );
    report.downvotes = report.downvotes.filter(
      (u) => u.toString() !== userId.toString()
    );

    // Update trust score safely
    if (voteType === "upvote") {
      if (!hadUpvote && report?.communityTrustScore) {
        report.communityTrustScore = Math.max(
          0,
          report.communityTrustScore + 1
        );
      }
      report.upvotes.push(userId);
    } else if (voteType === "downvote") {
      if (!hadDownvote && report?.communityTrustScore) {
        report.communityTrustScore = Math.max(
          0,
          report.communityTrustScore - 1
        );
      }
      report.downvotes.push(userId);
    }

    await report.save();

    // Recalculate billboard crowd confidence
    if (report.billboard?._id) {
      report.billboard.crowdConfidence = await recalculateCrowdConfidence(
        report.billboard._id
      );
      await report.billboard.save();

      return res.status(200).json({
        message: "Vote recorded",
        data: report,
        billboardConfidence: report.billboard.crowdConfidence,
      });
    }

    return res.status(200).json({
      message: "Vote recorded, but billboard not linked",
      data: report,
    });
  } catch (err) {
    console.error("Error voting report:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllReports,
  createReport,
  getReportsByUser,
  getReportById,
  updateReport,
  voteReport,
};
