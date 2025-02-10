import React, { useState, useEffect, useRef } from "react";
import {
  FaXTwitter,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaCamera,
  FaHouseChimney,
  FaDoorOpen,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { updateUserProfile } from "../../services/user-service/update-user-profile.js";
import { user_profile } from "../../services/user-service/profile.js";
import { FormField } from "../../utils/form-fields.jsx";
import reactLogo from "/react.svg";
import { log_out } from "../../services/user-service/logout.js";
import { FaExclamationCircle } from "react-icons/fa";

function UserProfile({ userId }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [active, setActive] = useState("overview");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Example token and userId - in a real application, get these from auth context or storage
  const token = localStorage.getItem("accessToken");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "edit", label: "Edit Profile" },
    { id: "password", label: "Change Password" },
  ];

  // Hook to navigate programmatically
  const navigate = useNavigate();

  const handleClick = () => {
    fileInputRef.current.click();
  };

  // Function to handle navigation to home and reload the page
  const goToHome = (e) => {
    e.preventDefault();
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    // Function to fetch user profile data
    const fetchProfile = async () => {
      try {
        // Check if userId is provided
        if (!userId) {
          throw new Error("User ID is not provided");
        }

        // Fetch profile data from the API
        const res = await user_profile(userId);

        const profileData = res.data || res;

        setUserProfile(profileData); // Set the first element as user profile
        // IInitialize local state values:

        setFirstName(profileData.first_name);
        setLastName(profileData.last_name);
        setImagePreview(profileData.display_picture); // Set the first element as user's image preview
        // Check if data is an array and has elements
        /* if (data && typeof data === "object" && !Array.isArray(data)) {
        } else {
          throw new Error("Profile data is not available");
        } */
      } catch (err) {
        console.error("Error fetching profile:", err); // Log error to console
        setError(err.message); // Set error message
      } finally {
        setLoading(false); // Stop loading indicator
      }
    };
    fetchProfile(); // Call the fetchProfile function
  }, [userId]); // Dependency array to trigger effect on userId change

  const handleProfileUpdate = async (e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);

    if (selectedFile) {
      formData.append("display_picture", selectedFile);
    }

    try {
      const res = await updateUserProfile(userId, formData);

      if (res.success) {
        setUserProfile((prev) => ({
          ...prev,
          first_name: firstName,
          last_name: lastName,
        }));
        setMessage("Profile updated successfully");
      } else {
        setMessage("Profile not updated");
        throw new Error(res.message || "Failed to update user profile");
      }
    } catch (error) {
      console.error("Error updating profile", error);
      // setMessage(error.message);
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Validate file type and size (max 2MB)
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        setMessage("Only image files are allowed");
        return;
      }
      if (file.size > 3 * 1024 * 1024) {
        setMessage("Image size must be under 3MB");
        return;
      }

      setSelectedFile(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const logOut = async (e) => {
    e.preventDefault();
    await log_out();
    navigate("/");
    window.location.reload();
  };

  /*  const handleChangePassword = async (e) => {
    e.preventDefault();
    // TODO: Implement password change logic
    const currentPassword = e.target.current_password.value;
    const newPassword = e.target.new_password.value;
    const confirmPassword = e.target.confirm_password.value;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await changePassword(userId, {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        alert("Password updated successfully");
      } else {
        throw new Error(res.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password", error);
      alert(error.message);
    }
  }; */

  // Render error state
  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <FaExclamationCircle className="h-5 w-5 text-red-600" />
        <div>
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-700 text-sm mt-1">{message}</p>
        </div>
      </div>
    );
  }
  if (!userProfile) {
    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
      <FaExclamationCircle className="h-5 w-5 text-red-600" />
      <div>
        <h3 className="text-red-800 font-semibold">404 Not Found</h3>
        <p className="text-red-700 text-sm mt-1">No user profile available.</p>
      </div>
    </div>;
  }

  // CSS classes for form elements
  const label = "col-span-12 md:col-span-4 lg:col-span-3 text-gray-700";
  const formControl =
    "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {loading ? (
        <div className="my-20 flex items-center justify-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-[ring_2.5s_cubic-bezier(0.77,0,0.18,1)_infinite] rounded-full border-[6px] border-solid border-neutral-200 [border-style:unset]">
              <div className="absolute inset-[-6px] rounded-full bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,transparent_50%,transparent_55%,#2563eb_100%)] opacity-75 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:xor]"></div>
            </div>
            <div className="absolute inset-0 animate-[spin_2.5s_cubic-bezier(0.77,0,0.18,1)_infinite] rounded-full [mask:radial-gradient(farthest-side,#0000_calc(100%_-_6px),#000_0)]">
              <div className="absolute inset-0 bg-[linear-gradient(#2563eb_0%,#3b82f6_10%,#60a5fa_30%,rgba(96,165,250,0)_80%)]"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="w-full xl:w-96 xl:flex-shrink-0">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div className="p-6 md:p-8 flex flex-col items-center">
                <div className="relative group">
                  <img
                    src={
                      imagePreview || userProfile?.display_picture || reactLogo
                    }
                    alt="Profile"
                    className="rounded-full w-24 h-24 md:w-32 md:h-32 object-cover border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-gray-800 tracking-tight">
                  {userProfile?.first_name || "NAME"}{" "}
                  {userProfile?.last_name || ""}
                </h2>
                <h3 className="mt-2 text-gray-600 font-medium text-sm md:text-base">
                  {userProfile?.email || "EMAIL"}
                </h3>

                <div className="mt-6 flex space-x-5">
                  {[
                    { icon: FaXTwitter, color: "text-gray-700" },
                    { icon: FaFacebookF, color: "text-blue-600" },
                    { icon: FaInstagram, color: "text-pink-500" },
                    { icon: FaLinkedinIn, color: "text-blue-700" },
                  ].map(({ icon: Icon, color }, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className={`${color} hover:opacity-80 transition-opacity p-2 rounded-full bg-gray-50 hover:bg-gray-100`}
                    >
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-1">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 border-b border-gray-100">
                <ul className="flex space-x-3 md:space-x-4 overflow-x-auto pb-2 md:pb-0">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        className={`px-3 py-1.5 rounded-lg font-semibold text-sm md:text-base transition-colors ${
                          active === tab.id
                            ? "bg-blue-100 text-blue-600"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                        onClick={() => setActive(tab.id)}
                      >
                        {tab.label}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 md:mt-0 flex space-x-3 w-full md:w-auto">
                  <button
                    onClick={logOut}
                    className="relative group px-6 py-3 overflow-hidden rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-white font-semibold shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    {/* Background overlay for a dynamic gradient reveal */}
                    <span className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 opacity-0 group-hover:opacity-30 transition duration-300"></span>
                    <span className="relative flex items-center space-x-2">
                      <FaDoorOpen className="w-6 h-6 transition-transform duration-300 group-hover:rotate-45" />
                      <span>Logout</span>
                    </span>
                  </button>

                  <button
                    onClick={goToHome}
                    className="relative group px-6 py-3 overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    {/* Background overlay for a dynamic gradient reveal */}
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-30 transition duration-300"></span>
                    <span className="relative flex items-center space-x-2">
                      <FaHouseChimney className="w-6 h-6 transition-transform duration-300 group-hover:rotate-45" />
                      <span>Home</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Content Sections */}
              <div className="p-6 md:p-8">
                {active === "overview" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-gray-800">About</h3>
                      <p className="text-gray-600 leading-relaxed">
                        Sunt est soluta temporibus accusantium neque nam maiores
                        cumque temporibus. Tempora libero non est unde veniam
                        est qui dolor...
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        Profile Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            label: "First Name",
                            value: userProfile?.first_name || "Kelvin",
                          },
                          {
                            label: "Last Name",
                            value: userProfile?.last_name || "Anderson",
                          },
                          {
                            label: "Email",
                            value:
                              userProfile?.email || "kanderson@example.com",
                          },
                          {
                            label: "Phone",
                            value: userProfile?.phone || "+1 123-456-7890",
                          },
                          {
                            label: "Role",
                            value: userProfile?.role || "Client",
                          },
                        ].map(({ label, value }, idx) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-xl">
                            <div className="text-sm font-medium text-gray-500 mb-1">
                              {label}
                            </div>
                            <div className="font-medium text-gray-800">
                              {value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Profile Tab */}
                {active === "edit" && (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {message && (
                      <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
                        {message}
                      </div>
                    )}

                    {loading ? (
                      <div className="my-20 flex items-center justify-center">
                        <div className="relative h-16 w-16">
                          <div className="absolute inset-0 animate-[ring_2.5s_cubic-bezier(0.77,0,0.18,1)_infinite] rounded-full border-[6px] border-solid border-neutral-200 [border-style:unset]">
                            <div className="absolute inset-[-6px] rounded-full bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,transparent_50%,transparent_55%,#2563eb_100%)] opacity-75 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:xor]"></div>
                          </div>
                          <div className="absolute inset-0 animate-[spin_2.5s_cubic-bezier(0.77,0,0.18,1)_infinite] rounded-full [mask:radial-gradient(farthest-side,#0000_calc(100%_-_6px),#000_0)]">
                            <div className="absolute inset-0 bg-[linear-gradient(#2563eb_0%,#3b82f6_10%,#60a5fa_30%,rgba(96,165,250,0)_80%)]"></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center space-x-6">
                          <div className="relative group">
                            <img
                              src={
                                imagePreview ||
                                userProfile?.display_picture ||
                                reactLogo
                              }
                              alt="Profile"
                              className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                            />
                            <button
                              type="button"
                              onClick={handleClick}
                              className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
                            >
                              <FaCamera className="w-5 h-5 text-gray-700 hover:text-gray-950" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                ref={fileInputRef}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            label="First Name"
                            type="text"
                            name="first_name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            labelClassName={label}
                            className={formControl}
                            required
                          />
                          <FormField
                            label="Last Name"
                            type="text"
                            name="last_name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            labelClassName={label}
                            className={formControl}
                            required
                          />
                          <FormField
                            label="Email"
                            className={formControl}
                            labelClassName={label}
                            type="email"
                            name="email"
                            value={userProfile?.email}
                            disabled
                          />
                          <FormField
                            label="Phone Number"
                            className={formControl}
                            labelClassName={label}
                            type="text"
                            name="phone"
                            value={userProfile?.phone}
                            disabled
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full md:w-auto px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-300"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Save Changes"}
                    </button>
                  </form>
                )}

                {/* Password Change Tab */}
                {active === "password" && (
                  <form className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        label="Current Password"
                        type="password"
                        placeholder="••••••••"
                        className={formControl}
                        required
                      />

                      <FormField
                        label="New Password"
                        type="password"
                        placeholder="••••••••"
                        className={formControl}
                        required
                      />

                      <FormField
                        label="Confirm New Password"
                        type="password"
                        placeholder="••••••••"
                        className={formControl}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full md:w-auto px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-300"
                    >
                      Update Password
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
