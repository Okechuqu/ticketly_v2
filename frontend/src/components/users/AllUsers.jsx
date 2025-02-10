import { FaArrowCircleLeft, FaArrowCircleRight, FaTrash } from "react-icons/fa";
import React, { useEffect, useState, useCallback } from "react";
import { FaTicket, FaXmark, FaLeftLong } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import ReactModal from "react-modal";
import { fetchAllUsers } from "../../services/user-service/fetch-all-users.js";
import { deleteUser } from "../../services/user-service/delete-users.js";
import { token, userRole } from "../../utils/util.js";
import { formatDate } from "../../utils/date-util.js";

const AllUsers = ({ userId }) => {
  // Data state
  const [userEmails, setUserEmails] = useState({});
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  // Other state
  const [searchQuery, setSearchQuery] = useState("");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate();

  // Declare delete permission.
  // Here we assume token.role holds the current user's role.
  const CAN_DELETE_USER = ["admin"].includes(userRole);

  // Fetch users from the API using pagination and search query.
  const getAllUsers = async () => {
    setIsLoading(true);
    try {
      // fetchAllUsers should accept an object with query parameters and return data & pagination info.
      const data = await fetchAllUsers({
        page: currentPage,
        limit,
        search: searchQuery,
      });

      // If data is an array or an object with a data property, extract the array.
      const usersArray = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];
      setUsers(usersArray);

      // Update pagination info if available.
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users on mount or when dependencies change.
  useEffect(() => {
    if (!token) {
      setError("You do not have permission to view persons. Please log in.");
      navigate("/login");
      window.location.reload();
      return;
    }
    getAllUsers();
  }, [userId, currentPage, searchQuery]); // refetch when page or search changes

  const handleDelete = async (person) => {
    setIsLoading(true);
    if (!person?._id) return;
    try {
      const res = await deleteUser(person._id);
      if (res) {
        setUsers((prev) => prev.filter((p) => p._id !== person._id));
      } else {
        console.error("Failed to delete person");
      }
    } catch (error) {
      console.error(error.message || "Couldn't delete person");
    }
    setIsLoading(false);
  };

  // Filter users. (Note: we now use 'users' instead of an undefined 'persons'.)
  const filteredUsers = users.filter((person) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
    return (
      fullName.includes(query) ||
      person._id.toString().toLowerCase().includes(query) ||
      (userEmails[person.created_by] &&
        userEmails[person.created_by].toLowerCase().includes(query)) ||
      (userRole[person.role] &&
        userRole[person.role].toLowerCase().includes(query))
    );
  });

  const openModal = (imgUrl) => {
    setSelectedImage(imgUrl);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setModalIsOpen(false);
  };

  // Reset page when search query changes.
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Header Section */}
      <header className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4 order-2 md:order-1 w-full md:w-auto">
            <Link
              to="/"
              className="absolute top-4 left-4 p-2 bg-blue-100 backdrop-blur-sm rounded-full shadow transition transform hover:scale-105 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <FaLeftLong className="h-6 w-6" />
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 order-1 md:order-2">
            All Users
          </h1>

          <div className="w-full md:w-auto order-3">
            <input
              type="text"
              placeholder="Search by Full_name or ID"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>
        </div>
      </header>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto p-4 md:p-8">
          {filteredUsers.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-xl shadow-2xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                    <tr>
                      {[
                        "ID",
                        "Image",
                        "Full_name",
                        "email",
                        "Role",
                        "Created Date",
                        ...(CAN_DELETE_USER ? ["Delete"] : []),
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left text-sm font-semibold text-white uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((person) => (
                      <tr
                        key={person._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          #{person._id.slice(-6)}
                        </td>
                        <td className="px-4 py-4">
                          {person.display_picture ? (
                            <img
                              src={person.display_picture}
                              alt="Display_picture"
                              className="h-16 w-24 object-cover rounded-lg cursor-zoom-in shadow-sm hover:shadow-md transition-shadow"
                              onClick={() => openModal(person.display_picture)}
                              onError={(e) => {
                                e.target.src =
                                  "https://placehold.co/100x50?text=No+Image";
                              }}
                            />
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 max-w-[200px] truncate">
                          {person.first_name} {person.last_name}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {person.email}
                            </span>
                          </div>
                        </td>
                        {/* Render Role and Created By in the correct order */}
                        <td className="px-4 py-4 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                          {person.role || "Loading..."}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                          {person.createdAt
                            ? formatDate(person.createdAt)
                            : "Loading..."}
                        </td>
                        {CAN_DELETE_USER && (
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Are you sure you want to delete this account?`
                                  )
                                ) {
                                  handleDelete(person);
                                }
                              }}
                              className={`transition-colors p-2 rounded-lg hover:bg-red-50 ${
                                person.role === "admin"
                                  ? "text-blue-700 opacity-50 cursor-not-allowed"
                                  : "text-red-500  hover:text-red-700 "
                              }`}
                              disabled={person.role === "admin"}
                            >
                              <FaTrash className="h-5 w-5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="text-sm text-gray-600">
                  Showing page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaArrowCircleLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <FaArrowCircleRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <FaTicket className="h-24 w-24 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No accounts found
              </h3>
              <p className="text-gray-600 max-w-prose mx-auto">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Recruit people to get started."}
              </p>
            </div>
          )}
        </main>
      )}

      {/* Modal for full-size image preview */}
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Image Modal"
        className="max-w-4xl mx-auto my-20 p-4 bg-white rounded-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center"
      >
        <div className="relative">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Full-size Display_picture"
              className="max-w-full max-h-screen rounded-lg"
            />
          )}
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-gray-700 bg-gray-100 rounded-full p-2 hover:bg-gray-200"
          >
            <FaXmark className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </ReactModal>
    </>
  );
};

export default AllUsers;
