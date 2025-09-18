const CivicIssue = require("../models/civicIssuesSchema");

const recalculateCrowdConfidence = async (civicIssueId) => {
  const civicIssue = await CivicIssue.findById(civicIssueId).populate(
    "reports"
  );

  if (!civicIssue) return null;

  const allReports = civicIssue.reports || [];
  if (allReports.length === 0) {
    civicIssue.crowdConfidence = 0;
    await civicIssue.save();
    return civicIssue;
  }

  let totalConfidence = 0;

  allReports.forEach((r) => {
    let baseConf = r.aiAnalysis?.confidence ?? 80;

    if (["verified_issue"].includes(r.status)) {
      baseConf = Math.min(100, baseConf + 20);
    }

    const trustScore = Math.max(0, r.communityTrustScore ?? 0);
    const trustNormalized = Math.min(trustScore / 10, 1);
    const effectiveConfidence = baseConf * (0.7 + 0.3 * trustNormalized);

    totalConfidence += effectiveConfidence;
  });

  const finalConfidence = Math.round(totalConfidence / allReports.length);
  civicIssue.crowdConfidence = finalConfidence;
  await civicIssue.save();
  return finalConfidence;
};

module.exports = recalculateCrowdConfidence;
