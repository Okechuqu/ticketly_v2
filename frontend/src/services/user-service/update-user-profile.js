import { API_URL, token } from "../../utils/util.js";

// Update user profile
export const updateUserProfile = async (id, formData) => {
  if (!token) {
    throw new Error("You haven't logged in properly");
  }

  // Validate user ID
  if (!id || typeof id !== "string") {
    throw new Error("Invalid user ID");
  }
  const sanitizeId = id.replace(/^"|"$/g, "");

  try {
    const res = await fetch(`${API_URL}/api/users/profile/${sanitizeId}`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      let errorMessage = `Error: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, proceed with the default error message.
      }
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (error) {
    alert(error.message);
    throw error;
  }
};
