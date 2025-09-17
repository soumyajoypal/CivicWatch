const express = require("express");
const verifyToken = require("../middleware/authMiddleware");
const {
  createReport,
  getReportsByUser,
  getReportById,
  getAllReports,
  updateReport,
  voteReport,
} = require("../controllers/reportController");
const verifyAdmin = require("../middleware/adminMiddleware");
const canUpdateReport = require("../middleware/checkRoleMiddleware");
const reportRouter = express.Router();

reportRouter.post("/submit", verifyToken, createReport);
reportRouter.get("/user/:userId", verifyToken, getReportsByUser);
reportRouter.get("/details/:reportId", verifyToken, getReportById);
reportRouter.post("/vote/:reportId", verifyToken, voteReport);
reportRouter.get("/all", verifyToken, verifyAdmin, getAllReports);
reportRouter.patch(
  "/update/:reportId",
  verifyToken,
  canUpdateReport,
  updateReport
);
module.exports = reportRouter;
