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
  violationType: {
    type: [String],
    required: true,
    enum: [
      "size_violation",
      "illegal_location",
      "structural_hazard",
      "missing_license",
      "obscene_content",
      "political_violation",
      "other",
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
  //compliance data
  suspectedDimensions: {
    height: { type: Number },
    width: { type: Number },
  },
  qrCodeDetected: {
    type: Boolean,
    default: false,
  },
  licenseId: {
    type: String,
  },
  //user info
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required!"],
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  //ai info
  aiAnalysis: {
    verdict: {
      type: String,
      enum: ["unauthorized", "authorized", "unsure"],
      default: "unsure",
    },
    confidence: { type: Number, default: 0 },
    detectedObjects: [{ type: String }],
  },
  //admin verification
  status: {
    type: String,
    enum: [
      "pending",
      "verified_unauthorized",
      "verified_authorized",
      "rejected",
    ],
    default: "pending",
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
  // billboard reference
  billboard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Billboard",
  },
  //gamification
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
