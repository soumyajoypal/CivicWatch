const Billboard = require("../models/billboardSchema");
const Report = require("../models/reportSchema");
const { NormalUser } = require("../models/rolesSchema");
const { generateImageHash } = require("./imageHash");
const calculateXP = require("./calculateXP");
const checkAndAwardBadges = require("./awardBadges");
const recalculateCrowdConfidence = require("./scoring");

const handleBillboardCreation = async (reportData) => {
  try {
    const imageHash = await generateImageHash(reportData.imageURL);

    let billboard = await Billboard.findOne({ imageHash }).populate("reports");

    if (billboard) {
      billboard.reports.push(reportData._id);

      if (
        ["verified_unauthorized", "verified_authorized"].includes(
          billboard.verifiedStatus
        )
      ) {
        // Update report status to match verified billboard
        reportData.status = billboard.verifiedStatus;
        reportData.reviewedBy = billboard.verifiedBy;
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
      billboard.crowdConfidence = await recalculateCrowdConfidence(
        billboard._id
      );
      await billboard.save();
    } else {
      // Create new billboard
      billboard = await Billboard.create({
        location: reportData.location,
        ocrText: reportData.aiAnalysis?.ocrText?.join(" ") || "",
        imageHash,
        reports: [reportData._id],
        verifiedStatus: "pending",
        crowdConfidence: 0,
      });
    }

    return billboard;
  } catch (error) {
    console.error("Error in handleBillboardCreation:", error);
    throw new Error("Failed to create or link billboard.");
  }
};

module.exports = { handleBillboardCreation };
