function calculateBillboardDimensions(exifData, distanceMeters) {
  if (distanceMeters <= 0) {
    throw new Error("Invalid distance to billboard");
  }

  const DEFAULT_EXIF = {
    FocalLength: 4.25,
    ExifImageWidth: 4000,
    ExifImageHeight: 3000,
    SensorWidth: 4.9,
    SensorHeight: 3.7,
    Orientation: 0,
  };

  const exif = { ...DEFAULT_EXIF, ...exifData };

  const { FocalLength, SensorWidth, SensorHeight } = exif;

  const horizontalFoV = 2 * Math.atan(SensorWidth / (2 * FocalLength));
  const verticalFoV = 2 * Math.atan(SensorHeight / (2 * FocalLength));
  const billboardWidth = 2 * distanceMeters * Math.tan(horizontalFoV / 2);
  const billboardHeight = 2 * distanceMeters * Math.tan(verticalFoV / 2);

  const angle = exif.Orientation || 0;

  return {
    width: Number(billboardWidth.toFixed(2)),
    height: Number(billboardHeight.toFixed(2)),
    angle,
  };
}

module.exports = calculateBillboardDimensions;
