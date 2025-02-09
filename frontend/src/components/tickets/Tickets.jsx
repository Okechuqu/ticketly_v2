import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowCircleLeft, FaArrowCircleRight, FaTrash } from "react-icons/fa";
import ReactModal from "react-modal";
import { fetchAllTickets } from "../../services/ticket-service/fetch-tickets.js";
import { updateTicket } from "../../services/ticket-service/update-ticket.js";
import { deleteTicket } from "../../services/ticket-service/deleteTicket.js";
import { user_profile } from "../../services/user-service/profile.js";
import { FormField } from "../../utils/form-fields.jsx";
import { token, userRole } from "../../utils/util.js";

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
      <div className="flex flex-row px-8 items-center justify-between bg-gray-400">
        {userProfile && (
          <button
            onClick={() => {
              navigate("/profile");
              window.location.reload();
            }}
            className="text-lg uppercase font-bold text-blue-700"
          >
            {userProfile.data.first_name}
          </button>
        )}
        {CAN_CREATE_TICKET && (
          <Link
            to="/create"
            // onClick={() => {
            //   navigate("/create");
            //   window.location.reload();
            // }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-2"
          >
            Create Ticket
          </Link>
        )}
        <h1 className="text-2xl uppercase font-bold text-red-700 text-center">
          Tickets
        </h1>
        <input
          type="text"
          placeholder="Search by Summary or ID"
          value={searchQuery}
          onChange={handleSearchChange}
          className="border p-2 m-2 text-white bg-gray-600 rounded"
        />
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="my-4 flex justify-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 animate-[ring_2.5s_cubic-bezier(0.77,0,0.18,1)_infinite] rounded-full border-[6px] border-neutral-200">
              <div className="absolute inset-[-6px] rounded-full bg-[conic-gradient(from_90deg_at_50%_50%,#fff_0%,transparent_50%,transparent_55%,#2563eb_100%)] opacity-75"></div>
            </div>
            <div className="absolute inset-0 animate-[spin_2.5s_cubic-bezier(0.77,0,0.18,1)_infinite] rounded-full">
              <div className="absolute inset-0 bg-[linear-gradient(#2563eb_0%,#3b82f6_10%,#60a5fa_30%,rgba(96,165,250,0)_80%)]"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {filteredTickets.length > 0 ? (
            <>
              <table className="min-w-full overflow-hidden rounded-lg shadow-lg">
                <thead className="bg-gradient-to-r from-neutral-300 to-neutral-50 text-center font-medium">
                  <tr>
                    <th scope="col" className="px-6 py-4">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Screenshot
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Summary
                    </th>
                    <th scope="col" className="px-6 py-4">
                      Status
                    </th>
                    {CAN_EDIT_TICKET && (
                      <th scope="col" className="px-6 py-4">
                        Created By
                      </th>
                    )}
                    {CAN_DELETE_TICKET && (
                      <th scope="col" className="px-6 py-4">
                        Delete
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket._id}
                      className="group transition-all duration-300 border-b border-dotted hover:bg-gradient-to-r hover:from-indigo-500 hover:to-blue-500 hover:text-white"
                    >
                      <th scope="row" className="px-6 py-4">
                        {ticket._id}
                      </th>
                      <td className="px-6 py-4">
                        {ticket.screenshot ? (
                          <img
                            src={ticket.screenshot}
                            alt="Screenshot"
                            className="w-20 h-12 object-cover rounded-lg border cursor-pointer transform transition-transform duration-300 hover:scale-105"
                            onClick={() => openModal(ticket.screenshot)}
                            onError={(e) => {
                              e.target.src =
                                "https://placehold.co/100x50?text=No+Image";
                            }}
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
                      <td className="px-6 py-4 capitalize">{ticket.summary}</td>
                      <td className="px-6 py-4">
                        {ticket.status}
                        {CAN_EDIT_TICKET && (
                          <FormField
                            type="select"
                            value={ticket.status}
                            options={STATUS_OPTIONS}
                            onChange={(e) =>
                              handleChange(ticket._id, e.target.value)
                            }
                            className="ml-2 inline-block rounded bg-gray-200 text-sm text-gray-700 px-2 py-1 transition-colors duration-300 group-hover:bg-gray-300"
                          />
                        )}
                      </td>
                      {CAN_EDIT_TICKET && (
                        <td className="px-6 py-4">
                          <button
                            className="cursor-pointer transition-colors duration-300 hover:text-yellow-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/profile/${ticket.created_by.id}`);
                            }}
                          >
                            {userEmails[ticket.created_by] || "Loading..."}
                          </button>
                        </td>
                      )}
                      {CAN_DELETE_TICKET && (
                        <td className="px-6 py-4">
                          <button
                            className="text-red-600 transition-colors duration-300 hover:text-red-800 cursor-pointer"
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
                          >
                            <FaTrash />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls */}
              <div className="flex justify-center mt-4 space-x-4">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaArrowCircleLeft />
                </button>
                <span className="text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaArrowCircleRight />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600 p-4">
              No tickets found.
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center mt-4">
              <div className="text-red-600 text-center bg-gray-100 p-2 rounded-md">
                {error}
              </div>
              {!userProfile && (
                <button
                  onClick={() => {
                    navigate("/login");
                    window.location.reload();
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-2"
                >
                  LOGIN
                </button>
              )}
            </div>
          )}
        </div>
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
            ✕
          </button>
        </div>
      </ReactModal>
    </>
  );
};

export default Tickets;
