import { API_URL, token } from "../../utils/util.js";

/**
 * Deletes a ticket by its ID.
 *
 * @param {string|number} id - The unique identifier of the ticket to delete.
 * @returns {Promise<Object>} - The response data from the API.
 * @throws {Error} - Throws an error if the token is missing, the ID is invalid, or the API call fails.
 */
export const deleteTicket = async (id) => {
  // Validate the ticket ID
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new Error("Invalid ticket ID - must be a non-empty string");
  }

  // Retrieve the token dynamically (ensures you're always using the latest token)
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  try {
    const res = await fetch(`${API_URL}/api/tickets/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // Check if the response is not OK (status outside the 200-299 range)
    if (!res.ok) {
      let errorMessage = res.statusText;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // If JSON parsing fails, fallback to statusText
      }
      alert(`Error deleting ticket: ${errorMessage}`);
      throw new Error(`Error deleting ticket: ${errorMessage}`);
    }

    // Parse and return the JSON data from the response
    return await res.json();
  } catch (error) {
    console.error(`Unable to delete ticket: ${error.message}`);
    throw error;
  }
};
