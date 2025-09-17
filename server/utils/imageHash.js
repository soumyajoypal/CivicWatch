const { imageHash } = require("image-hash");

const generateImageHash = (imageURL) =>
  new Promise((resolve, reject) => {
    imageHash(imageURL, 16, true, (error, data) => {
      if (error) return reject(error);
      resolve(data);
    });
  });

module.exports = { generateImageHash };
