import { API_URL, token } from "../../utils/util.js";

/**
 * Creates a new ticket with validation and error handling

 */
export const createTicket = async (ticket) => {
  // Validate input structure
  if (!ticket || typeof ticket !== "object" || Array.isArray(ticket)) {
    throw new Error("Invalid ticket data - must be an object");
  }

  // Authentication check
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }

  try {
    const res = await fetch(`${API_URL}/api/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(ticket),
    });

    const responseData = await res.json().catch(() => null);
    console.log("responseData: ", responseData);

    if (!res.ok) {
      const errorMessage =
        responseData?.message || `HTTP error! status: ${res.status}`;
      alert(`Server error: ${errorMessage} (Status: ${res.status})`);
      throw new Error(`Server error: ${errorMessage} (Status: ${res.status})`);
    }

    if (!responseData) {
      alert("Received empty response from server");
      throw new Error("Received empty response from server");
    }

    alert("Your Ticket has been created, you can view from the home page.");
    return responseData;
  } catch (error) {
    alert(`Ticket creation failed: ${error.message}`);
    throw new Error(error.message);
  }
};
