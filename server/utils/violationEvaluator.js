const checkRestrictedZone = require("./checkRestrictedZone");

const evaluateHoardingViolations = async (hoardings = []) => {
  const results = [];

  for (const h of hoardings) {
    const violationCodes = []; // enum-friendly values
    const detectedObjects = [];

    const width = Number(h.width);
    const height = Number(h.height);
    const angle = Number(h.angle);

    // 1️⃣ Size & Angle Checks
    if (width <= 60 || height >= 20) {
      violationCodes.push("size_violation");
      detectedObjects.push("oversized/undersized hoarding");
    }

    if (angle > 30) {
      violationCodes.push("structural_hazard"); // misuse angle as hazard
      detectedObjects.push("improper angle");
    }

    // 2️⃣ Content Violations (OCR keywords → obscene_content)
    const bannedKeywords = ["alcohol", "drugs", "nudity", "porn", "tobacco"];
    if (Array.isArray(h.ocrText)) {
      for (const ocrItem of h.ocrText) {
        const text = ocrItem.text.toLowerCase();
        for (const word of bannedKeywords) {
          if (text.includes(word)) {
            violationCodes.push("obscene_content");
            detectedObjects.push(word);
          }
        }
      }
    }

    // 3️⃣ Dynamic Restricted Zone Check
    if (h.gps) {
      const restrictedMsg = await checkRestrictedZone(h.gps.lat, h.gps.lon);
      if (restrictedMsg) {
        violationCodes.push("illegal_location");
        detectedObjects.push("restricted-zone");
      }
    }

    // 4️⃣ AI Verdict & Confidence
    let verdict = "authorized";
    let confidence = 0.9;

    if (violationCodes.length > 0) {
      verdict = "unauthorized";
      confidence = 0.95;
    } else if (detectedObjects.length === 0) {
      verdict = "unsure";
      confidence = 0.5;
    }

    results.push({
      violationType: violationCodes,
      aiAnalysis: { verdict, confidence, detectedObjects },
    });
  }

  return { status: "success", results };
};

module.exports = evaluateHoardingViolations;
