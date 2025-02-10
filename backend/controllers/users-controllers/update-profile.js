import sanitizeFilename from "sanitize-filename";
import expressAsyncHandler from "express-async-handler";
import upload from "../../middlewares/multer-config.js";
import User from "../../models/users-model.js";
import fs from "fs/promises";

const uploadMiddleware = upload.single("display_picture");

// @desc Update user profile

export const updateUserProfile = expressAsyncHandler(async (req, res) => {
  const { first_name, last_name } = req.body;
  const { id } = req.params;

  // Validate Fields
  if (!first_name || !last_name) {
    return res
      .status(400)
      .json({ error: true, message: "Can't update with empty fields" });
  }

  if (!req.file) {
    return res
      .status(400)
      .json({ error: true, message: "Update profile with a new image" });
  }

  // Handle the file upload
  if (req.file) {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({ error: true, message: "Only JPG/PNG images allowed" });
    }

    if (req.file.size > maxSize) {
      return res
        .status(400)
        .json({ error: true, message: "File size exceeds 5MB limit" });
    }

    // Sanitize the filename to prevent security issues
    req.file.filename = sanitizeFilename(req.file.filename).replace(
      /\s+/g,
      "_"
    );
  }

  /*   const relativePath = req.file.path;

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const display_picture = `${baseUrl}/${relativePath}`; */

  try {
    const fileBuffer = await fs.readFile(req.file.path);
    const display_picture = `data:${req.file.mimetype};base64,${Buffer.from(
      fileBuffer
    ).toString("base64")}`;

    const user = await User.findByIdAndUpdate(
      id,
      { first_name, last_name, display_picture },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: true, message: "Server Error" });
  }
});

export const uploadProfilePicture = expressAsyncHandler(
  async (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        console.error(err);
        return res
          .status(400)
          .json({ error: true, message: "File upload error" });
      }
      next();
    });
  }
);
