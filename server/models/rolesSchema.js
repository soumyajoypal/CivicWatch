const mongoose = require("mongoose");
const User = require("./userSchema");

const normalUserSchema = new mongoose.Schema({
  xp: { type: Number, default: 0 },
  reportsSubmitted: { type: Number, default: 0 },
  reportsVerified: { type: Number, default: 0 },
  badges: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      dateEarned: { type: Date, default: Date.now },
    },
  ],
  leaderBoardPosition: {
    type: Number,
    default: 0,
  },
});

const adminSchema = new mongoose.Schema({
  permissions: {
    type: [String],
    default: ["viewReports", "verifyReports", "manageUsers"],
  },
  verifiedReports: { type: Number, default: 0 },
  rejectedReports: { type: Number, default: 0 },
  adminCode: {
    type: String,
    unique: true,
    required: [true, "Admin code is required!"],
  },
});

const NormalUser = User.discriminator("NormalUser", normalUserSchema);
const AdminUser = User.discriminator("AdminUser", adminSchema);

module.exports = { NormalUser, AdminUser };
