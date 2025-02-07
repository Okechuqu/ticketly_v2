import expressAsyncHandler from "express-async-handler";

export const uploadToCloudSTorage = expressAsyncHandler(async (base64) => {
  // Implement cloud storage upload logic here
  const result = await cloudinary;
});
