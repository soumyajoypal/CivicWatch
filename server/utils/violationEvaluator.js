const checkRestrictedZone = require("./checkRestrictedZone");

const objectMap = {
  pothole: "road",
  overflowing_bin: "bin",
  broken_streetlight: "streetlight",
  waterlogging: "water",
  fallen_tree: "tree",
  illegal_dumping: "waste",
};

const evaluateCivicIssues = async (detections = [], gps) => {
  const violationCodes = [];
  const detectedObjects = [];

  for (const det of detections) {
    if (det.confidence > 0.1) {
      violationCodes.push(det.class_name);
      const mappedObj = objectMap[det.class_name];
      if (mappedObj && !detectedObjects.includes(mappedObj)) {
        detectedObjects.push(mappedObj);
      }
    }
  }

  if (gps) {
    const restrictedMsg = await checkRestrictedZone(gps.lat, gps.lon);
    if (restrictedMsg) {
      violationCodes.push("restricted_zone");
      if (!detectedObjects.includes("restricted_zone")) {
        detectedObjects.push("restricted_zone");
      }
    }
  }

  let verdict = "unsure";
  let confidence = 0.5;

  if (violationCodes.length > 0) {
    verdict = "action_required";
    const avgConf =
      detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length;
    const multiplier = Math.min(1, 0.8 + detections.length * 0.05);

    confidence = Math.min(1, avgConf * multiplier);
  } else if (detections.length === 0) {
    verdict = "action_not_required";
    confidence = 0.6 + Math.random() * 0.2;
  }

  return {
    issueType: violationCodes,
    aiAnalysis: { verdict, confidence, detectedObjects },
  };
};

module.exports = evaluateCivicIssues;
