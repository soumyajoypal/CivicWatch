const express = require("express");
const civicIssueRouter = express.Router();
const {
  getAllCivicIssues,
  civicIssuesFeed,
  getCivicIssueDetails,
} = require("../controllers/civicIssuesController");
const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");

civicIssueRouter.get("/", verifyToken, verifyAdmin, getAllCivicIssues);
civicIssueRouter.get("/feed", verifyToken, civicIssuesFeed);
civicIssueRouter.get(
  "/details/:civicIssueId",
  verifyToken,
  getCivicIssueDetails
);
module.exports = civicIssueRouter;
