const Billboard = require("../models/billboardSchema");

const recalculateCrowdConfidence = async (billboardId) => {
  const billboard = await Billboard.findById(billboardId).populate("reports");

  if (!billboard) return null;

  const allReports = billboard.reports || [];
  if (allReports.length === 0) {
    billboard.crowdConfidence = 0;
    await billboard.save();
    return billboard;
  }

  let totalConfidence = 0;

  allReports.forEach((r) => {
    let baseConf = r.aiAnalysis?.confidence ?? 80;

    if (["verified_unauthorized", "verified_authorized"].includes(r.status)) {
      baseConf = Math.min(100, baseConf + 20);
    }

    const trustScore = Math.max(0, r.communityTrustScore ?? 0);
    const trustNormalized = Math.min(trustScore / 10, 1);
    const effectiveConfidence = baseConf * (0.7 + 0.3 * trustNormalized);

    totalConfidence += effectiveConfidence;
  });

  billboard.crowdConfidence = Math.round(totalConfidence / allReports.length);

  await billboard.save();
  return billboard;
};

module.exports = recalculateCrowdConfidence;
