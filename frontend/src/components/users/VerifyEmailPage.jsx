import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../utils/util.js";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/verify-email/${token}`);

        console.log("res: ", res);

        const contentType = res.headers.get("content-type") || "";

        let data;

        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          data.message = "Server did not return a valid json";
        }

        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.message || "Verification Failed");
        }
      } catch (error) {
        console.error("Omo Error verifying email:", error);
        setStatus("error");
        setMessage("An error occurred during verification.");
      }
    };

    verifyEmail();
  }, [token]);

  const goToHome = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full space-y-6 transform transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">
          Email Verification
        </h1>

        {status === "pending" && (
          <div className="flex items-center justify-center space-x-3 animate-pulse">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-blue-600 font-medium">Verifying email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="bg-green-50 p-4 rounded-xl space-y-2 text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <p className="text-green-700 font-semibold text-lg">{message}</p>
            <button
              onClick={goToHome}
              className="px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Home Page
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="bg-red-50 p-4 rounded-xl space-y-3 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <p className="text-red-600 font-medium">{message}</p>
            <p className="text-red-500 text-sm hover:underline hover:text-red-700 transition-colors cursor-pointer">
              Please try again later
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
