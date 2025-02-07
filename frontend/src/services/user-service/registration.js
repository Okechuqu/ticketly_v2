import { API_URL } from "../../utils/util.js";

// Function to register a new user
export const registration = async (userData) => {
  // Validate user data
  if (!userData || typeof userData !== "object" || Array.isArray(userData)) {
    throw new Error("Invalid user data - must be an object");
  }

  try {
    const res = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    // Check if response is not OK
    if (!res.ok) {
      let errorMessage = `Failed to register user (Status: ${res.status})`;

      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        console.warn("Failed to parse error response as JSON.");
      }

      throw new Error(errorMessage);
    }

    // Parse response
    const data = await res.json();
    console.log("Registration successful:", data);

    // Notify user
    alert("Registered successfully! Please check your email for confirmation.");

    return data;
  } catch (error) {
    console.error("Error registering user:", error.message);
    alert(error.message); // Only alert if an error actually occurs
    throw error;
  }
};
