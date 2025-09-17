const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  //media
  imageURL: {
    type: String,
    required: [true, "Image URL is required!"],
  },
  annotatedURL: {
    type: String,
    required: [true, "Annotated URL is required!"],
  },
  //billboard information
  issueDescription: {
    type: String,
    required: [true, "Issue description is required!"],
    trim: true,
  },
  issueType: {
    type: [String],
    required: true,
    enum: [
      "potholes",
      "overflowing_bin",
      "broken_streetlight",
      "waterlogging",
      "fallen_tree",
      "illegal_dumping",
      "other",
      "restricted_zone",
    ],
  },
  //geo-data
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: { type: String, default: "N/A" },
    zoneId: { type: String, default: "N/A" },
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required!"],
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  aiAnalysis: {
    verdict: {
      type: String,
      enum: ["action_required", "action_not_required", "unsure"],
      default: "unsure",
    },
    confidence: { type: Number, default: 0 },
    detectedObjects: [{ type: String }],
  },
  //admin verification
  status: {
    type: String,
    enum: ["pending", "verified_issue", "rejected"],
    default: "pending",
  },
  assignedDepartment: {
    type: [String],
    enum: ["sanitation", "public_works", "electricity", "environment", "other"],
    default: undefined,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedAt: {
    type: Date,
  },
  adminNotes: {
    type: String,
  },
  // civic issue reference
  civicIssue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CivicIssue",
  },
  xpAwarded: { type: Number, default: 0 },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  communityTrustScore: { type: Number, default: 0 },
});

reportSchema.index({ location: "2dsphere" });

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;
