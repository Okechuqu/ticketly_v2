import { API_URL } from "../../utils/util.js";

// Function to log in a user
export const loging_in = async (userData) => {
  // Validate input structure
  if (!userData || typeof userData !== "object") {
    alert("Invalid login data format");
    return;
  }

  // Validate credentials
  const { email, phone, password } = userData;
  if ((!email && !phone) || !password) {
    alert("Please provide email/phone and password");
    return;
  }
  // Check password is more than 8 character
  if (password.length < 8) {
    alert("Password must be at least 8 characters long");
    return;
  }

  // Check if the user is already logged in
  /* if (token) {
    alert("You are already logged in.");
    return;
  } */

  // Check if the user is using an unsupported browser
  if (!window.localStorage) {
    alert(
      "Your browser does not support local storage. Please use a different browser."
    );
    return;
  }

  // Check if the user is offline
  if (!navigator.onLine) {
    alert("You are not connected to the internet. Please try again later.");
    return;
  }

  try {
    // Sanitize and format request data
    const requestBody = {
      ...(email && { email: email.trim().toLowerCase() }),
      ...(phone && { phone: phone.trim().replace(/[^\d+]/g, "") }),
      password: password.trim(),
    };

    const res = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Check if response is not OK
    if (!res.ok) {
      let errorMessage = `Login faileded (Status: ${res.status})`;

      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        alert("Failed to parse error response as JSON.");
        return;
      }

      throw new Error(errorMessage);
    }

    // Parse response
    const data = await res.json();

    // Ensure data is valid before storing
    if (data && data.accessToken && data.user) {
      localStorage.setItem("accessToken", JSON.stringify(data.accessToken));
      localStorage.setItem("role", JSON.stringify(data.user.role));
      localStorage.setItem("userId", JSON.stringify(data.user._id));
    } else {
      alert("No valid token or user data received.");
      return;
    }

    return data;
  } catch (error) {
    console.error("Error logging in:", error.message);
    throw error;
  }
};
