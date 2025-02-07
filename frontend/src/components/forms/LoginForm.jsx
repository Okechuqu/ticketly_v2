import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loging_in } from "../../services/user-service/login.js";
import { FormField } from "../../utils/form-fields.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import reactLogo from "/react.svg";

const Login = () => {
  const [active, setActive] = useState("email");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });

  const navigate = useNavigate();

  // Handle input change and update form data state
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Prepare payload based on active tab (email or phone)
    const payload =
      active === "email"
        ? { email: formData.email, password: formData.password }
        : { phone: formData.phone, password: formData.password };

    try {
      // Attempt to log in
      await loging_in(payload);
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Login failed", error.message);
      // Set error message based on active tab
      setError(
        active === "email"
          ? "Invalid email or password."
          : "Invalid phone number or password."
      );
    }
    setLoading(false);
  };

  // CSS classes for form elements
  const label = "text-white py-2";
  const formControl =
    "bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

  return (
    <div className="flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 bg-gray-900">
      <Link
        to=""
        className="flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white"
      >
        <img src={reactLogo} className="mr-4 h-11" alt="Okechuqu Logo" />
        <span>Okechuqu</span>
      </Link>
      <div className="w-full max-w-xl p-6 space-y-8 sm:p-8 rounded-lg shadow dark:bg-gray-800">
        {active === "email" && (
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Sign in with Email
          </h2>
        )}
        {active === "phone" && (
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Sign in with Phone number
          </h2>
        )}
        {/* Tab Buttons */}
        <div className="flex border-b border-gray-300">
          <button
            className={`px-4 py-2 transition duration-200 ${
              active === "email"
                ? "text-white border-blue-500 bg-gray-600 border-b-2 rounded-xl"
                : "hover:text-blue-600 text-gray-600"
            }`}
            onClick={() => setActive("email")}
          >
            Email
          </button>
          <button
            className={`px-4 py-2 border-b-2 transition duration-200 ${
              active === "phone"
                ? "text-white border-blue-500 bg-gray-600 border-b-2 rounded-xl"
                : "hover:text-blue-600 text-gray-600"
            }`}
            onClick={() => setActive("phone")}
          >
            Phone Number
          </button>
        </div>

        {/* Tab Contents */}
        <div className="mt-4">
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <div className="tab-content px-4 shadow-md rounded-md">
            <form onSubmit={handleSubmit}>
              {active === "email" ? (
                <FormField
                  className={formControl}
                  label="Email"
                  labelClassName={label}
                  type="email"
                  placeholder="mail@gmail.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              ) : (
                <FormField
                  className={formControl}
                  label="Phone"
                  labelClassName={label}
                  type="text"
                  placeholder="+234 "
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              )}
              <div className="relative">
                <FormField
                  className={formControl}
                  label="Your password"
                  labelClassName={label}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-13 text-gray-600 dark:text-gray-400"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="flex items-start mt-6">
                <div className="flex items-center h-5">
                  <FormField
                    label=""
                    type="checkbox"
                    className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="remember"
                    className="font-medium text-gray-900 dark:text-white"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="#"
                  className="ml-auto text-sm text-blue-700 hover:underline dark:text-blue-500"
                >
                  Lost Password?
                </Link>
              </div>
              <button
                type="submit"
                className="w-full px-5 py-3 text-base font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Login to your account"}
              </button>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Not registered?{" "}
                <Link
                  to="/register"
                  className="text-blue-700 hover:underline dark:text-blue-500"
                >
                  Create account
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
