import { API_URL, token } from "../../utils/util.js";

/**
 * Function to fetch all users with optional pagination and search query.
 *
 * @param {Object} params - The query parameters for fetching users.
 * @param {number} [params.page=1] - The page number to fetch.
 * @param {number} [params.limit=5] - The number of users per page.
 * @param {string} [params.search=""] - An optional search query to filter users.
 * @returns {Promise<Object>} - A promise that resolves to the users data and pagination info.
 * @throws {Error} - Throws an error if the token is missing or if the API call fails.
 */
export const fetchAllUsers = async ({
  page = 1,
  limit = 5,
  search = "",
} = {}) => {
  if (!token) {
    throw new Error("You haven't logged in properly");
  }

  // Construct the URL with pagination and search parameters
  const url = `${API_URL}/api/users/users?page=${page}&limit=${limit}&search=${encodeURIComponent(
    search
  )}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Check if the response is not OK
    if (!res.ok) {
      let errorMessage = res.statusText;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // Fallback if JSON parsing fails
      }
      console.log(
        `Error fetching users: ${errorMessage} (Status: ${res.status})`
      );
      throw new Error(
        `Error fetching users: ${errorMessage} (Status: ${res.status})`
      );
    }

    // Validate that the response is JSON
    const contentType = res.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      console.log("Invalid response format - expected JSON");
      throw new Error("Invalid response format - expected JSON");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.log("Error fetching all users:", error.message);
    throw error;
  }
};
