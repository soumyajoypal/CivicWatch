const calculateXP = (report) => {
  let baseXP = 10;

  // weight violation type
  const violationWeights = {
    size_violation: 20,
    illegal_location: 30,
    structural_hazard: 40,
    missing_license: 25,
    obscene_content: 35,
    political_violation: 30,
    other: 10,
  };

  let violationXP = 0;
  report.violationType.forEach((v) => {
    violationXP += violationWeights[v] || 5;
  });

  // AI confidence (scale up to +20 XP)
  const aiXP = Math.round(report.aiAnalysis.confidence * 20);

  // community input (each upvote +2 XP, downvote -1 XP)
  const engagementXP =
    (report.upvotes?.length || 0) * 2 - (report.downvotes?.length || 0);

  // total
  return baseXP + violationXP + aiXP + engagementXP;
};

module.exports = calculateXP;
