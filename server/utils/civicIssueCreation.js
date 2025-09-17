const CivicIssue = require("../models/civicIssuesSchema");
const Report = require("../models/reportSchema");
const { NormalUser } = require("../models/rolesSchema");
const { generateImageHash } = require("./imageHash");
const calculateXP = require("./calculateXP");
const checkAndAwardBadges = require("./awardBadges");
const recalculateCrowdConfidence = require("./scoring");

const handleCivicIssueCreation = async (reportData) => {
  try {
    const imageHash = await generateImageHash(reportData.imageURL);

    let civicIssue = await CivicIssue.findOne({ imageHash }).populate(
      "reports"
    );

    if (civicIssue) {
      civicIssue.reports.push(reportData._id);

      if (["verified_issue"].includes(civicIssue.verifiedStatus)) {
        // Update report status to match verified civic issue
        reportData.status = civicIssue.verifiedStatus;
        reportData.reviewedBy = civicIssue.verifiedBy;
        reportData.reviewedAt = new Date();

        // Give XP with late-report multiplier
        const baseXP = calculateXP(reportData);
        const lateXP = Math.round(baseXP * 0.3); // 30% of normal XP
        reportData.xpAwarded = lateXP;
        await NormalUser.findByIdAndUpdate(reportData.reportedBy, {
          $inc: { xp: lateXP },
        });
      }

      await checkAndAwardBadges(reportData.reportedBy, { report: reportData });
      await reportData.save();
      civicIssue.crowdConfidence = await recalculateCrowdConfidence(
        civicIssue._id
      );
      await civicIssue.save();
    } else {
      // Create new civic issue
      civicIssue = await CivicIssue.create({
        location: reportData.location,
        ocrText: reportData.aiAnalysis?.ocrText?.join(" ") || "",
        imageHash,
        reports: [reportData._id],
        verifiedStatus: "pending",
        crowdConfidence: 0,
      });
    }

    return civicIssue;
  } catch (error) {
    console.error("Error in handleCivicIssueCreation:", error);
    throw new Error("Failed to create or link civic issue.");
  }
};

module.exports = handleCivicIssueCreation;
