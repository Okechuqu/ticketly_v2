import { API_URL, token } from "../../utils/util.js";

// Function to log out a user
export const log_out = async () => {
  try {
    if (token) {
      const res = await fetch(`${API_URL}/api/users/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.warn(`Logout request failed: ${res.status}`);
      }
    }
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    // Clear user data from localStorage regardless of request success
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
  }
};
