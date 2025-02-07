import { API_URL, token } from "../../utils/util.js";

// Function to update the status of a ticket by ID
export const updateTicket = async (id, status) => {
  if (!token) {
    throw new Error("You haven't logged in properly");
  }

  // Validate ticket ID
  if (!id || typeof id !== "string") {
    throw new Error("Invalid ticket ID");
  }

  // Validate status
  if (!status || typeof status !== "string") {
    throw new Error("Invalid status value");
  }

  try {
    const res = await fetch(`${API_URL}/api/tickets/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }), // Send only the status
    });

    if (!res.ok) {
      let errorMessage = `Error updating ticket (Status: ${res.status})`;

      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        console.error("Failed to parse error response as JSON.");
      }

      throw new Error(errorMessage);
    }

    return await res.json(); // Return updated ticket
  } catch (error) {
    console.error(`Unable to update ticket: ${error.message}`);
    throw error;
  }
};
