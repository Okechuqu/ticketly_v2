import { API_URL, token } from "../../utils/util.js";

/**
 * Change the user's password.
 *
 * @param {string} id - The user ID.
 * @param {string} oldPassword - The user's current password.
 * @param {string} newPassword - The new password.
 * @returns {Promise<Object>} - The API response data.
 * @throws {Error} - If the request fails or inputs are invalid.
 */
export const changeUserPassword = async (id, oldPassword, newPassword) => {
  // Retrieve the token dynamically from storage
  if (!token) {
    throw new Error("You haven't logged in properly");
  }

  // Validate input parameters
  if (!id || typeof id !== "string") {
    throw new Error("Invalid user ID");
  }
  if (!oldPassword || !newPassword) {
    throw new Error("Both current and new passwords are required");
  }
  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters");
  }

  try {
    const res = await fetch(`${API_URL}/api/users/${id}/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!res.ok) {
      let errorMessage = `Error: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Fallback if response is not JSON
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    alert(`Failed to change password: ${error.message}`);
    throw new Error(`Failed to change password: ${error.message}`);
  }
};
