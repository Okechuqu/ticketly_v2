import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registration } from "../../services/user-service/registration.js";
import { FormField } from "../../utils/form-fields.jsx";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import reactLogo from "/react.svg";

const AgentAdminRegisterForm = () => {
  // State to manage form data
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
    acceptTerms: false,
  });

  // State to manage error messages
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Handle input changes and update form data state
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
      role,
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
      await registration({
        first_name,
        last_name,
        email,
        phone,
        password,
        role,
      });
      navigate("/login");
    } catch (error) {
      setError(error.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  // CSS classes for form elements
  const label = "text-white py-2";
  const formControl =
    "bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

  return (
    <div>
      <div className="flex flex-col items-center justify-center px-6 pt-8 mx-auto md:h-screen pt:mt-0 dark:bg-gray-900">
        <Link
          to="/"
          className="flex items-center justify-center mb-8 text-2xl font-semibold lg:mb-10 dark:text-white"
        >
          <img src={reactLogo} className="mr-4 h-11" alt="Okechuqu Logo" />
          <span>Okechuqu</span>
        </Link>
        {/* <!-- Card --> */}
        <div className="w-full max-w-2xl p-6 space-y-8 sm:p-8 bg-white rounded-lg shadow dark:bg-gray-800">
          <form className="mt-8 space-y-6 " onSubmit={handleSubmit}>
            <div className="flex flex-row gap-8 ">
              <div>
                <FormField
                  label="First Name"
                  className={formControl}
                  labelClassName={label}
                  type="text"
                  placeholder="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Last Name"
                  className={formControl}
                  labelClassName={label}
                  type="text"
                  placeholder="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
                <FormField
                  label="Email"
                  className={formControl}
                  labelClassName={label}
                  type="email"
                  placeholder="mail@gmail.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <div className="flex flex-1 text-sm mt-12">
                  <FormField
                    label=""
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                    required
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="font-medium ml-3 text-gray-900 dark:text-white"
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
              </div>
              <div>
                <FormField
                  label="Phone"
                  className={formControl}
                  labelClassName={label}
                  type="text"
                  placeholder="+234 "
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
                <div className="relative">
                  <FormField
                    label="Your password"
                    className={formControl}
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
                <div className="relative">
                  <FormField
                    label="Confirm password"
                    className={formControl}
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
                <FormField
                  label="Role"
                  type="select"
                  className={formControl}
                  labelClassName={label}
                  name="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  options={["client", "agent", "admin"]}
                />
              </div>
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
    </div>
  );
};

export default AgentAdminRegisterForm;
