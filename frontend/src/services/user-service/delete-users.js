import { API_URL, token } from "../../utils/util.js";

/**
 * Deletes a user by its ID.
 *
 * @param {string} id - The unique identifier of the user to delete.
 * @returns {Promise<Object>} - The response data from the API.
 * @throws {Error} - Throws an error if the token is missing, the ID is invalid, or the API call fails.
 */
export const deleteUser = async (id) => {
  // Validate the user ID (assuming user IDs are non-empty strings)
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new Error("Invalid user ID - must be a non-empty string");
  }

  // Ensure that the token is available.
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  try {
    const res = await fetch(`${API_URL}/api/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // If the response is not OK, extract an error message and throw an error.
    if (!res.ok) {
      let errorMessage = res.statusText;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // Fallback to statusText if JSON parsing fails.
      }
      alert(`Error deleting user: ${errorMessage}`);
      throw new Error(`Error deleting user: ${errorMessage}`);
    }

    // Parse and return the JSON data from the response.
    return await res.json();
  } catch (error) {
    console.error(`Unable to delete user: ${error.message}`);
    throw error;
  }
};
