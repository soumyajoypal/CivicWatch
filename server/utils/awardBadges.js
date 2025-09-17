const Report = require("../models/reportSchema");
const NormalUser = require("../models/userSchema");

const checkAndAwardBadges = async (userId, action = {}) => {
  const user = await NormalUser.findById(userId);
  if (!user) return;
  console.log(user);

  const reportsCount = await Report.countDocuments({ reportedBy: userId });
  const zonesReported = await Report.distinct("location.zoneId", {
    reportedBy: userId,
  });
  const commentsCount = user.commentsMade || 0; 
  const overriddenCount = user.aiOverridesCorrect || 0; 

  const badgesToAward = [];

  if (reportsCount === 1 && !hasBadge(user, "Rookie Reporter")) {
    badgesToAward.push({
      name: "Rookie Reporter",
      description: "Submitted your first report!",
    });
  }

  if (reportsCount === 5 && !hasBadge(user, "Persistent Eye")) {
    badgesToAward.push({
      name: "Persistent Eye",
      description: "Submitted 5 reports!",
    });
  }

  if (
    action.report &&
    action.report.upvotes?.length >= 10 &&
    !hasBadge(user, "Community Favorite")
  ) {
    badgesToAward.push({
      name: "Community Favorite",
      description: "One of your reports got 10+ upvotes!",
    });
  }

  if (zonesReported.length >= 3 && !hasBadge(user, "Zone Expert")) {
    badgesToAward.push({
      name: "Zone Expert",
      description: "Reported in 3 different zones.",
    });
  }

  if (overriddenCount >= 3 && !hasBadge(user, "AI Challenger")) {
    badgesToAward.push({
      name: "AI Challenger",
      description: "Correctly overrode AI verdict 3 times.",
    });
  }

  if (commentsCount >= 5 && !hasBadge(user, "Social Critic")) {
    badgesToAward.push({
      name: "Social Critic",
      description: "Commented on 5 reports.",
    });
  }

  if (badgesToAward.length > 0) {
    user.badges.push(
      ...badgesToAward.map((b) => ({ ...b, dateEarned: new Date() }))
    );
    await user.save();
  }
  console.log(user);
};

const hasBadge = (user, badgeName) =>
  user.badges.some((b) => b.name === badgeName);

module.exports = checkAndAwardBadges;
