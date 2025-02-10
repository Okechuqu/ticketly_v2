import asyncHandler from "express-async-handler";
import User from "../../models/users-model.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Agent/Admin only
export const getAllUsers = asyncHandler(async (req, res) => {
  // Destructure query parameters with defaults.
  const { page = 1, limit = 5, search = "" } = req.query;

  // Convert page and limit to numbers.
  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 5;
  const startIndex = (pageNumber - 1) * limitNumber;

  // Build the query. If a search term is provided, look in first_name, last_name, email, and created_by, role.
  let query = {};
  if (search && search.trim() !== "") {
    const searchRegex = { $regex: search, $options: "i" };
    query = {
      $or: [
        { first_name: searchRegex },
        { last_name: searchRegex },
        { email: searchRegex },
        { created_by: searchRegex },
        { role: searchRegex },
      ],
    };
  }

  try {
    // Count the total matching documents.
    const totalUsers = await User.countDocuments(query);

    // Find the users with the specified pagination and sorting.
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limitNumber);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limitNumber),
        currentPage: pageNumber,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: true, message: "Server Error" });
  }
});
