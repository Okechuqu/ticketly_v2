// Export the API URL from environment variables
export const API_URL = import.meta.env.VITE_API_URL;

// Retrieve the access token from localStorage and parse it
const accessToken = localStorage.getItem("accessToken");
export const token = accessToken ? JSON.parse(accessToken) : null; // Ensure token is parsed only if it exists

// Retrieve the user role from localStorage and parse it
const role = localStorage.getItem("role");
export const userRole = role ? JSON.parse(role) : null; // Ensure role is parsed only if it exists
token;
