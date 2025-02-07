import { useAuth } from "../components/users/AuthProvider.jsx";

export const useCustomFetch = () => {
  const { accessToken, refreshToken, updateTokens, logout } = useAuth();

  const customFetch = async (url, options = {}) => {
    // Clone options to avoid side effects
    const opts = { ...options };
    opts.headers = {
      ...opts.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    // Make the initial request
    let response = await fetch(url, opts);

    // If the response is unauthorized, try refreshing the token
    if (response.status === 401) {
      // Call your refresh endpoint
      const refreshResponse = await fetch(
        `${API_URL}/api/users/refresh-token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: refreshToken }),
        }
      );

      // If refresh was successful, update the access token and retry the original request
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const newAccessToken = data.accessToken;

        // Update the token in context (and localStorage)
        updateTokens(newAccessToken);

        // Retry the original request with the new token
        opts.headers.Authorization = `Bearer ${newAccessToken}`;
        response = await fetch(url, opts);
      } else {
        // If token refresh fails, log out the user (or handle accordingly)
        logout();
      }
    }

    return response;
  };

  return customFetch;
};
