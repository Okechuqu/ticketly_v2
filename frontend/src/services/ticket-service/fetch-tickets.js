import { API_URL, token } from "../../utils/util.js";

/**
 * Function to fetch all tickets with an optional search query.
 *
 * @param {string} [searchQuery=""] - An optional search query to filter tickets.
 * @returns {Promise<Object[]>} - A promise that resolves to an array of ticket objects.
 * @throws {Error} - Throws an error if the token is missing or if the API call fails.
 */
export const fetchAllTickets = async (searchQuery = "") => {
  if (!token) {
    throw new Error("You haven't logged in properly");
  }

  // Construct the URL based on the presence of a search query
  const url = searchQuery
    ? `${API_URL}/api/tickets?search=${encodeURIComponent(searchQuery)}`
    : `${API_URL}/api/tickets`;

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
        `Error fetching tickets: ${errorMessage} (Status: ${res.status})`
      );
      throw new Error(
        `Error fetching tickets: ${errorMessage} (Status: ${res.status})`
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
    console.log("Error fetching all tickets:", error.message);
    throw error;
  }
};
