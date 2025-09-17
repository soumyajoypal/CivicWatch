const mongoose = require("mongoose");

const billboardSchema = new mongoose.Schema({
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

  ocrText: {
    type: String,
    default: "",
  },

  imageHash: {
    type: String,
    required: true,
  },

  reports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
  ],

  crowdConfidence: {
    type: Number,
    default: 0,
  },

  verifiedStatus: {
    type: String,
    enum: [
      "pending",
      "verified_unauthorized",
      "verified_authorized",
      "rejected",
    ],
    default: "pending",
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  verifiedAt: {
    type: Date,
  },

  adminNotes: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

billboardSchema.index({ location: "2dsphere" });

const Billboard = mongoose.model("Billboard", billboardSchema);
module.exports = Billboard;
