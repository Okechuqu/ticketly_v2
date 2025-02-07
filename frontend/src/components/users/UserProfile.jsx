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
        alert("Profile updated successfully");
      } else {
        setMessage("Profile not updated");
        throw new Error(res.message || "Failed to update user profile");
      }
    } catch (error) {
      console.error("Error updating profile", error);
      alert(error.message);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
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

  // Render loading state
  if (loading) {
    return (
      <div className="my-40 flex items-center justify-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-[ring_2.5s_cubic-bezier(0.77,0,0.18,1)_infinite] rounded-full border-[6px] border-solid border-neutral-200 [border-style:unset]">
            <div className="absolute inset-[-6px] rounded-full bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,transparent_50%,transparent_55%,#2563eb_100%)] opacity-75 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:xor]"></div>
          </div>
          <div className="absolute inset-0 animate-[spin_2.5s_cubic-bezier(0.77,0,0.18,1)_infinite] rounded-full [mask:radial-gradient(farthest-side,#0000_calc(100%_-_6px),#000_0)]">
            <div className="absolute inset-0 bg-[linear-gradient(#2563eb_0%,#3b82f6_10%,#60a5fa_30%,rgba(96,165,250,0)_80%)]"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return <div className="text-red-600">Error: {error}</div>;
  }

  // Render when no profile data is available
  if (!userProfile) {
    return <div>No profile data available</div>;
  }

  // CSS classes for form elements
  const label = "col-span-12 md:col-span-4 lg:col-span-3 text-gray-700";
  const formControl =
    "col-span-12 md:col-span-8 lg:col-span-9 w-full p-2 border rounded";

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <div className="flex flex-wrap">
        {/* Left Column */}
        <div className="w-full xl:w-1/3 p-2">
          <div className="bg-white shadow rounded-lg">
            <div className="p-6 flex flex-col items-center">
              <img
                src={imagePreview || userProfile?.display_picture || reactLogo}
                alt="Profile"
                className="rounded-full w-32 h-32 object-cover"
              />
              {/* {userProfile?.phone} */}
              <h2 className="mt-4 text-xl font-bold">
                {userProfile?.first_name || "NAME"}{" "}
                {userProfile?.last_name || ""}{" "}
              </h2>
              <h3 className="text-gray-600">{userProfile?.email || "EMAIL"}</h3>
              <div className="flex mt-4 space-x-4">
                <a href="#" className="text-gray-700 hover:text-gray-900">
                  <FaXTwitter />
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-800">
                  <FaFacebookF />
                </a>
                <a href="#" className="text-pink-500 hover:text-pink-700">
                  <FaInstagram />
                </a>
                <a href="#" className="text-blue-700 hover:text-blue-900">
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full xl:w-2/3 p-2">
          <div className="bg-white shadow rounded-lg">
            <div className="flex p-6 pb-0 justify-between">
              <ul className="flex border-b border-gray-200 space-x-4 ">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      className={`pb-2 px-2 border-b-2 transition-colors ${
                        active === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-600 hover:text-blue-600"
                      }`}
                      onClick={() => setActive(tab.id)}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-center space-x-6">
                {/* Logout Button */}
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

                {/* Home Button */}
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
            <div className="w-full p-2">
              {/* Overview Tab */}
              {active === "overview" && (
                <div className={` bg-white shadow rounded-lg p-6 pt-0`}>
                  <h3 className="text-lg font-semibold mb-4">About</h3>
                  <p className="text-gray-600 italic mb-6">
                    Sunt est soluta temporibus accusantium neque nam maiores
                    cumque temporibus. Tempora libero non est unde veniam est
                    qui dolor...
                  </p>

                  <h3 className="text-lg font-semibold mb-4">
                    Profile Details
                  </h3>

                  <div className="grid grid-cols-12 gap-4 mb-3">
                    <div className="col-span-12 md:col-span-4 rounded-4xl w-30 lg:col-span-3 text-gray-100 px-2 bg-blue-500">
                      First Name
                    </div>
                    <div className="col-span-12 md:col-span-8 lg:col-span-9">
                      {userProfile?.first_name || "Kelvin"}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 mb-3">
                    <div className="col-span-12 md:col-span-4 rounded-4xl w-30 lg:col-span-3 text-gray-100 px-2 bg-blue-500">
                      Last Name
                    </div>
                    <div className="col-span-12 md:col-span-8 lg:col-span-9">
                      {userProfile?.last_name || "Anderson"}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 mb-3">
                    <div className="col-span-12 md:col-span-4 rounded-4xl w-30 lg:col-span-3 text-gray-100 px-2 bg-blue-500">
                      Email
                    </div>
                    <div className="col-span-12 md:col-span-8 lg:col-span-9">
                      {userProfile?.email || "kanderson@example.com"}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 mb-3">
                    <div className="col-span-12 md:col-span-4 rounded-4xl w-30 lg:col-span-3 text-gray-100 px-2 bg-blue-500">
                      Phone
                    </div>
                    <div className="col-span-12 md:col-span-8 lg:col-span-9">
                      {userProfile?.phone || "+1 123-456-7890"}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4 mb-3">
                    <div className="col-span-12 md:col-span-4 rounded-4xl w-30 lg:col-span-3 text-gray-100 px-2 bg-blue-500">
                      Role
                    </div>
                    <div className="col-span-12 md:col-span-8 lg:col-span-9">
                      {userProfile?.role || "Client"}
                    </div>
                  </div>
                </div>
              )}
              {/* Edit Profile Tab */}
              {active === "edit" && (
                <div className={` bg-white shadow rounded-lg p-6 pt-0`}>
                  {message && (
                    <p className="text-lg font-semibold mb-4">{message}</p>
                  )}
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid  gap-4 mb-4">
                      <label className="col-span-12 md:col-span-4 lg:col-span-3 text-gray-700">
                        Profile Image
                      </label>
                      <div className="col-span-12 md:col-span-8 lg:col-span-9">
                        <div className="flex flex-col  space-x-4">
                          <img
                            src={
                              imagePreview ||
                              userProfile?.display_picture ||
                              reactLogo
                            }
                            alt="Profile"
                            className="w-16 h-16 rounded-full"
                          />
                          <div>
                            <button
                              className="px-3 mx-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              onClick={handleClick}
                              type="button"
                            >
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                ref={fileInputRef}
                              />
                              <FaCamera />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-4 mb-4">
                      <FormField
                        label="First Name"
                        className={formControl}
                        labelClassName={label}
                        type="text"
                        name="first_name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />

                      <FormField
                        label="Last Name"
                        className={formControl}
                        labelClassName={label}
                        type="text"
                        name="last_name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
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

                    <div className="text-center mt-6">
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        type="submit"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Password Change Tab */}
              {active === "password" && (
                <div className={` bg-white shadow rounded-lg p-6 pt-0`}>
                  <form>
                    <div className="grid  gap-4 mb-4">
                      <FormField
                        label="Current Password"
                        className={formControl}
                        labelClassName={label}
                        type="password"
                        placeholder="Your Current Password"
                        name="password"
                        value={userProfile?.password}
                        // onChange={handleChange}
                        required
                      />

                      <FormField
                        label="New Password"
                        className={formControl}
                        labelClassName={label}
                        type="password"
                        placeholder="Your New Password"
                        name="new_password"
                        value={userProfile?.new_password}
                        // onChange={handleChange}
                        required
                      />

                      <FormField
                        label="Confirm New Password"
                        className={formControl}
                        labelClassName={label}
                        type="password"
                        placeholder="Confirm New Password"
                        name="confirm_new_password"
                        value={userProfile?.confirm_new_password}
                        // onChange={handleChange}
                        required
                      />
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
