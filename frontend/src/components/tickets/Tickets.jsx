import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowCircleLeft,
  FaArrowCircleRight,
  FaPlusCircle,
  FaTrash,
  FaUserCircle,
} from "react-icons/fa";
import ReactModal from "react-modal";
import { fetchAllTickets } from "../../services/ticket-service/fetch-tickets.js";
import { updateTicket } from "../../services/ticket-service/update-ticket.js";
import { deleteTicket } from "../../services/ticket-service/deleteTicket.js";
import { user_profile } from "../../services/user-service/profile.js";
import { FormField } from "../../utils/form-fields.jsx";
import { token, userRole } from "../../utils/util.js";
import { FaXmark } from "react-icons/fa6";

const Tickets = ({ userId }) => {
  // Data state
  const [tickets, setTickets] = useState([]);
  const [userEmails, setUserEmails] = useState({});
  const [userProfile, setUserProfile] = useState(null);
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

  const STATUS_OPTIONS = ["CREATED", "IN_PROGRESS", "REJECTED", "COMPLETED"];
  const CAN_EDIT_TICKET = ["admin", "agent"].includes(userRole);
  const CAN_DELETE_TICKET = ["admin", "client"].includes(userRole);
  const CAN_CREATE_TICKET = ["client"].includes(userRole);

  // Update ticket status both in UI and on the server
  const handleChange = async (ticketId, newStatus) => {
    const originalTickets = [...tickets];
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket._id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    );
    try {
      await updateTicket(ticketId, newStatus);
    } catch (error) {
      console.error(error.message || "Couldn't update ticket");
      setTickets(originalTickets);
    }
  };

  // Fetch tickets from the API using pagination and search query.
  const getAllTickets = async () => {
    setIsLoading(true);
    try {
      // We assume fetchAllTickets now accepts an object with query parameters
      // and returns an object with { data, pagination }.
      const data = await fetchAllTickets({
        page: currentPage,
        limit,
        search: searchQuery,
      });
      // data may either be an array or an object with data & pagination
      const ticketsArray = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];
      setTickets(ticketsArray);

      // If pagination metadata is returned, update totalPages
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
      } else {
        // Fallback: if no pagination info is provided, assume one page.
        setTotalPages(1);
      }

      // Build the map of userEmails (assumes ticket.created_by is a unique identifier)
      const emails = ticketsArray.reduce((acc, ticket) => {
        acc[ticket.created_by] = ticket.created_by || "N/A";
        return acc;
      }, {});
      setUserEmails(emails);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user profile and tickets on mount and when dependencies change.
  useEffect(() => {
    if (!token) {
      setError("You do not have permission to view tickets. Please log in.");
      navigate("/login");
      window.location.reload();
      return;
    }

    const fetchProfile = async () => {
      try {
        const data = await user_profile(userId);
        setUserProfile(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfile();
    getAllTickets();
  }, [userId, currentPage, searchQuery]); // refetch tickets when page or search query changes

  const handleDelete = async (ticket) => {
    setIsLoading(true);
    if (!ticket?._id) return;
    try {
      const res = await deleteTicket(ticket._id);
      if (res) {
        setTickets((prev) => prev.filter((t) => t._id !== ticket._id));
      } else {
        console.error("Failed to delete ticket");
      }
    } catch (error) {
      console.error(error.message || "Couldn't delete ticket");
    }
    setIsLoading(false);
  };

  // Client-side filtering is no longer needed if your API handles search,
  // but you can keep additional filtering here if desired.
  const filteredTickets = tickets.filter((ticket) => {
    const query = searchQuery.toLowerCase();
    return (
      ticket.summary.toLowerCase().includes(query) ||
      ticket._id.toString().toLowerCase().includes(query) ||
      userEmails[ticket.created_by]?.toLowerCase() === query
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

  // When the user changes the search input, reset to page 1.
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
            {userProfile && (
              <Link
                to="/profile"
                className="text-lg font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
              >
                <FaUserCircle className="h-6 w-6" />
                <span className="truncate max-w-[120px]">
                  {userProfile.data.first_name}
                </span>
              </Link>
            )}
            {CAN_CREATE_TICKET && (
              <Link
                to="/create"
                className="ml-auto md:ml-0 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
              >
                <FaPlusCircle className="h-5 w-5" />
                <span className="hidden sm:inline">Create Ticket</span>
              </Link>
            )}
          </div>

          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 order-1 md:order-2">
            Tickets
          </h1>

          <div className="w-full md:w-auto order-3">
            <input
              type="text"
              placeholder="Search by Summary or ID"
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
          {filteredTickets.length > 0 ? (
            <>
              <div className="overflow-x-auto rounded-xl shadow-2xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                    <tr>
                      {[
                        "ID",
                        "Screenshot",
                        "Summary",
                        "Status",
                        ...(CAN_EDIT_TICKET ? ["Created By"] : []),
                        ...(CAN_DELETE_TICKET ? ["Delete"] : []),
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
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          #{ticket._id.slice(-6)}
                        </td>
                        <td className="px-4 py-4">
                          {ticket.screenshot ? (
                            <img
                              src={ticket.screenshot}
                              alt="Screenshot"
                              className="h-16 w-24 object-cover rounded-lg cursor-zoom-in shadow-sm hover:shadow-md transition-shadow"
                              onClick={() => openModal(ticket.screenshot)}
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
                          {ticket.summary}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {ticket.status}
                            </span>
                            {CAN_EDIT_TICKET && (
                              <FormField
                                type="select"
                                value={ticket.status}
                                options={STATUS_OPTIONS}
                                onChange={(e) =>
                                  handleChange(ticket._id, e.target.value)
                                }
                                className="ml-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              />
                            )}
                          </div>
                        </td>
                        {CAN_EDIT_TICKET && (
                          <td className="px-4 py-4 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                            <Link
                              to={`/profile/${ticket.created_by.id}`}
                              className="flex items-center gap-2"
                            >
                              <UserIcon className="h-5 w-5 text-gray-400" />
                              {userEmails[ticket.created_by] || "Loading..."}
                            </Link>
                          </td>
                        )}
                        {CAN_DELETE_TICKET && (
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    `Are you sure you want to delete ticket?`
                                  )
                                ) {
                                  handleDelete(ticket);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50"
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
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                <TicketIcon className="h-24 w-24 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tickets found
              </h3>
              <p className="text-gray-600 max-w-prose mx-auto">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "Create your first ticket to get started."}
              </p>
            </div>
          )}
        </main>
      )}

      {/* React Modal for displaying the image */}
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
              alt="Full-size Screenshot"
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

export default Tickets;
