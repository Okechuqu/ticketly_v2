import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registration } from "../../services/user-service/registration.js";
import { FormField } from "../../utils/form-fields.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import reactLogo from "/react.svg";
const ClientRegisterForm = () => {
  // State to manage form data
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  // State to manage errors and password visibility
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      confirmPassword,
      acceptTerms,
    } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email address");
      return;
    }

    if (!/^\+?[0-9]{7,15}$/.test(phone)) {
      setError("Invalid phone number");
      return;
    }

    if (!acceptTerms) {
      setError("You must accept the Terms and Conditions");
      return;
    }

    setLoading(true);
    try {
      await registration({ first_name, last_name, email, phone, password });
      navigate("/login");
    } catch (error) {
      setError(error.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  // CSS classes
  const label = "text-white py-2";
  const formControl =
    "bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

  return (
    <div className="flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen bg-gray-900">
      <Link
        to="/"
        className="flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white"
      >
        <img src={reactLogo} className="mr-4 h-11" alt="Okechuqu Logo" />
        <span>Okechuqu</span>
      </Link>

      <div className="w-full max-w-2xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800">
        

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-row gap-8">
            <div>
              <FormField
                className={formControl}
                label="First Name"
                labelClassName={label}
                type="text"
                placeholder="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <FormField
                className={formControl}
                label="Last Name"
                labelClassName={label}
                type="text"
                placeholder="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
              <FormField
                className={formControl}
                label="Email"
                labelClassName={label}
                type="email"
                placeholder="mail@gmail.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <FormField
                className={formControl}
                label="Phone"
                labelClassName={label}
                type="text"
                placeholder="+234 "
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              {/* Password Field with Peep Feature */}
              <div className="relative">
                <FormField
                  className={formControl}
                  label="Your Password"
                  labelClassName={label}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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

              {/* Confirm Password Field with Peep Feature */}
              <div className="relative">
                <FormField
                  className={formControl}
                  label="Confirm Password"
                  labelClassName={label}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-13 text-gray-600 dark:text-gray-400"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start">
            <FormField
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              required
            />
            <label
              htmlFor="acceptTerms"
              className="ml-3 text-sm text-gray-900 dark:text-white"
            >
              I accept the{" "}
              <Link
                to="#"
                className="text-blue-700 hover:underline dark:text-blue-500"
              >
                Terms and Conditions
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full px-5 py-3 text-base font-medium text-center text-white rounded-lg sm:w-auto transition-colors 
              ${
                loading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              }
            `}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {/* Already have an account? */}
          <div className="float-end text-sm font-medium text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-700 hover:underline dark:text-blue-500"
            >
              Login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientRegisterForm;
