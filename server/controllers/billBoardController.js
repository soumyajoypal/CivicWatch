const { StatusCodes } = require("http-status-codes");
const Billboard = require("../models/billboardSchema");
const { BadRequest } = require("../errors");

const getAllBillboards = async (req, res) => {
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

  const [billboards, total] = await Promise.all([
    Billboard.find(query)
      .populate({
        path: "reports",
        select:
          "imageURL aiAnalysis confidence upvotes downvotes status communityTrustScore submittedAt",
        options: { sort: { submittedAt: -1 }, limit: 1 }, // only latest report
      })
      .sort({ "reports.submittedAt": -1 })
      .skip(skip)
      .limit(limitNum),
    Billboard.countDocuments(query),
  ]);

  // Format the same way as billboardFeed
  const formatted = billboards.map((b) => {
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
    message: "Billboards retrieved successfully.",
  });
};

const billBoardFeed = async (req, res) => {
  const feedBillboards = await Billboard.find()
    .populate({
      path: "reports",
      options: { sort: { submittedAt: -1 }, limit: 1 },
      select:
        "imageURL aiAnalysis confidence upvotes downvotes status communityTrustScore",
    })
    .limit(5)
    .exec();

  const billboardFeed = feedBillboards.map((b) => {
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

  res.status(200).json({ success: true, data: billboardFeed });
};

const getBillBoardDetails = async (req, res) => {
  const { billboardId } = req.params;

  if (!billboardId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Billboard ID is required.",
    });
  }

  const billboard = await Billboard.findById(billboardId).populate({
    path: "reports",
    select:
      "reportedBy submittedAt status xpAwarded upvotes downvotes aiAnalysis imageURL annotatedImageURL communityTrustScore",
    populate: {
      path: "reportedBy",
      select: "username email",
    },
  });
  // SORT BY COMMUNITY TRUST SCORE DESCENDING

  if (!billboard) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Billboard not found.",
    });
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    data: billboard,
    message: "Billboard retrieved successfully.",
  });
};

module.exports = { getAllBillboards, billBoardFeed, getBillBoardDetails };
