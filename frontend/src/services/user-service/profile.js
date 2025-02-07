import { API_URL, token } from "../../utils/util.js";

// Function to fetch user profile
export const user_profile = async (id) => {
  if (!id) {
    console.log("User ID is required to fetch profile.");
    return;
  }

  if (!token) {
    console.log("Authentication required. Please log in.");
    return;
  }

  const sanitizeId = id.replace(/^"|"$/g, "");

  try {
    const res = await fetch(`${API_URL}/api/users/profile/${sanitizeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      let errorMessage = `Error: ${res.status} ${res.statusText}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        console.log("Non-JSON error response received.");
        return;
      }
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (error) {
    console.log("Failed to fetch user profile:", error.message);
    throw new Error("Unable to retrieve profile. Please try again later.");
  }
};
