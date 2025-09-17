const axios = require("axios");

async function checkRestrictedZone(lat, lon) {
  try {
    console.log("Checking restricted zone for:", lat, lon);
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await axios.get(url, {
      headers: { "User-Agent": "Billguard-Hackathon/1.0" },
    });

    const address = res.data.address;
    const restrictedTypes = ["school", "hospital", "park", "church", "museum"];
    for (const type of restrictedTypes) {
      if (address[type]) {
        return `Restricted zone detected: ${address[type]}`;
      }
    }

    return null;
  } catch (err) {
    console.error("Error checking restricted zone:", err.message);
    return null;
  }
}

module.exports = checkRestrictedZone;
