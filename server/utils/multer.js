const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary").v2;

const uploadStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const ext = file.mimetype.split("/")[1];
    if (!["jpg", "jpeg", "png"].includes(ext)) {
      throw new Error("Unsupported file type");
    }
    return {
      folder: "UserUploads",
      format: ext,
      public_id: `user-upload-${Date.now()}`,
    };
  },
});

const uploadImages = multer({ storage: uploadStorage });

module.exports = uploadImages;
