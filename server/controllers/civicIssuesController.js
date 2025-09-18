const { StatusCodes } = require("http-status-codes");
const CivicIssue = require("../models/civicIssuesSchema");
const { BadRequest } = require("../errors");

const getAllCivicIssues = async (req, res) => {
  const { role } = req.user;
  if (role === "NormalUser") throw new BadRequest("Not allowed");

  const {
    status,
    minConfidence,
    maxConfidence,
    zoneId,
    fromDate,
    toDate,
    page = 1,
    limit = 10,
  } = req.query;

  const query = {};

  if (status) {
    query["reports.status"] = status;
  }

  if (zoneId) {
    query["location.zoneId"] = zoneId;
  }

  if (minConfidence || maxConfidence) {
    query["reports.confidence"] = {};
    if (minConfidence) query["reports.confidence"].$gte = Number(minConfidence);
    if (maxConfidence) query["reports.confidence"].$lte = Number(maxConfidence);
  }

  if (fromDate || toDate) {
    query["reports.submittedAt"] = {};
    if (fromDate) query["reports.submittedAt"].$gte = new Date(fromDate);
    if (toDate) query["reports.submittedAt"].$lte = new Date(toDate);
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [civicIssues, total] = await Promise.all([
    CivicIssue.find(query)
      .populate({
        path: "reports",
        select:
          "imageURL aiAnalysis confidence upvotes downvotes status communityTrustScore submittedAt",
        options: { sort: { submittedAt: -1 }, limit: 1 }, // only latest report
      })
      .sort({ "reports.submittedAt": -1 })
      .skip(skip)
      .limit(limitNum),
    CivicIssue.countDocuments(query),
  ]);

  // Format the same way as civicIssuesFeed
  const formatted = civicIssues.map((b) => {
    const latestReport = b.reports[0];

    let communityConfidence = null;
    if (latestReport) {
      const totalVotes =
        (latestReport.upvotes || 0) + (latestReport.downvotes || 0);
      if (totalVotes > 0) {
        communityConfidence = (latestReport.upvotes / totalVotes) * 100;
      }
    }

    return {
      id: b._id, // use id instead of _id
      imageURL: latestReport?.imageURL || "",
      location: b.location,
      crowdConfidence: b.crowdConfidence ?? 0,
      communityConfidence,
      verifiedStatus: b.verifiedStatus || "pending",
    };
  });

  return res.status(StatusCodes.OK).json({
    data: formatted,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
    message: "Civic Issues retrieved successfully.",
  });
};

const civicIssuesFeed = async (req, res) => {
  const feedCivicIssues = await CivicIssue.find()
    .populate({
      path: "reports",
      options: { sort: { submittedAt: -1 }, limit: 1 },
      select:
        "imageURL aiAnalysis confidence upvotes downvotes status communityTrustScore",
    })
    .limit(5)
    .exec();

  const civicIssuesFeed = feedCivicIssues.map((b) => {
    const latestReport = b.reports[0];

    let communityConfidence = null;
    if (latestReport) {
      const totalVotes =
        (latestReport.upvotes || 0) + (latestReport.downvotes || 0);
      if (totalVotes > 0) {
        communityConfidence = (latestReport.upvotes / totalVotes) * 100;
      }
    }

    return {
      id: b._id,
      imageURL: latestReport?.imageURL || "",
      location: b.location,
      crowdConfidence: b.crowdConfidence ?? 0,
      communityConfidence,
      verifiedStatus: b.verifiedStatus || "pending",
    };
  });

  res.status(200).json({ success: true, data: civicIssuesFeed });
};

const getCivicIssueDetails = async (req, res) => {
  const { civicIssueId } = req.params;
  const { role } = req.user;

  if (!civicIssueId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Civic Issue ID is required.",
    });
  }

  let civicIssue = await CivicIssue.findById(civicIssueId).populate({
    path: "reports",
    select:
      "reportedBy submittedAt status xpAwarded upvotes downvotes aiAnalysis imageURL annotatedURL communityTrustScore",
    populate: {
      path: "reportedBy",
      select: "username email",
    },
  });
  // SORT BY COMMUNITY TRUST SCORE DESCENDING

  if (!civicIssue) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Civic Issue not found.",
    });
  }

  if (role === "AdminUser" && civicIssue.reports?.length > 0) {
    civicIssue = civicIssue.toObject();

    civicIssue.reports.sort((a, b) => {
      const upA = Array.isArray(a.upvotes) ? a.upvotes.length : 0;
      const upB = Array.isArray(b.upvotes) ? b.upvotes.length : 0;
      return upB - upA;
    });
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    data: civicIssue,
    message: "Civic Issue retrieved successfully.",
  });
};

module.exports = { getAllCivicIssues, civicIssuesFeed, getCivicIssueDetails };
