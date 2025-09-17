const calculateXP = (report) => {
  let baseXP = 10;
  const issueWeights = {
    pothole: 25,
    overflowing_bin: 20,
    broken_streetlight: 30,
    waterlogging: 35,
    fallen_tree: 40,
  };

  let issueXP = 0;
  (report.issueType || []).forEach((issue) => {
    issueXP += issueWeights[issue] || 5; // fallback if unmapped
  });

  const aiXP = Math.round((report.aiAnalysis?.confidence || 0) * 20);

  const engagementXP =
    (report.upvotes?.length || 0) * 2 - (report.downvotes?.length || 0) * 1;

  return baseXP + issueXP + aiXP + engagementXP;
};

module.exports = calculateXP;
