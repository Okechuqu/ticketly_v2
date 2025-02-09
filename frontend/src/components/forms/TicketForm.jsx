import { FaLeftLong, FaPencil, FaTrash, FaUpload } from "react-icons/fa6";
import { FaExclamationCircle, FaPlusCircle } from "react-icons/fa";
import React, { useEffect, useState, useCallback } from "react";
import { createTicket } from "../../services/ticket-service/create-tickets.js";
import { resizeImage } from "../../utils/resize-image.js";
import { formatDate } from "../../utils/date-util.js";
import { FormField } from "../../utils/form-fields.jsx";

const TicketForm = ({
  id = "",
  screenshot = "",
  summary = "",
  status = "CREATED",
  createDate = new Date(),
  updateDate = new Date(),
  readonly = false,
  onSubmit = () => {},
  onClear = () => {},
}) => {
  const STATUS_OPTIONS = ["CREATED", "IN_PROGRESS", "REJECTED", "COMPLETED"];

  const [formData, setFormData] = useState({
    screenshot,
    summary,
    status,
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(screenshot);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset form only when a new ticket ID is set
  useEffect(() => {
    setFormData({
      screenshot,
      summary,
      status,
    });
    setImagePreview(screenshot);
    setFileName("");
  }, [id]);

  const isValidImage = (value) => {
    if (!value) return false;
    if (value.startsWith("data:image/")) return true; // Base64

    // Try to create a new URL, which will only succeed if it's a valid URL
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.summary || formData.summary.trim().length < 5) {
      newErrors.summary = "Summary must be at least 5 characters";
    }

    if (!STATUS_OPTIONS.includes(formData.status)) {
      newErrors.status = "Invalid status selection";
    }

    if (!formData.screenshot || !isValidImage(formData.screenshot)) {
      newErrors.screenshot = "Valid image URL or base64 required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size (max 2MB)
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        screenshot: "Only image files allowed",
      }));
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        screenshot: "File size must be under 3MB",
      }));
      return;
    }

    setFileName(file.name);

    // Resize image if necessary and update preview
    resizeImage(file)
      .then((resizedDataUrl) => {
        setFormData((prev) => ({ ...prev, screenshot: resizedDataUrl }));
        setImagePreview(resizedDataUrl);
      })
      .catch(() =>
        setErrors((prev) => ({ ...prev, screenshot: "Error loading image" }))
      );
  }, []);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await createTicket({
        ...formData,
        createDate,
        updateDate: new Date().toISOString(),
      });
      onSubmit(result);
    } catch (error) {
      console.error(error.message || "Failed to create ticket");
    }

    if (!id) {
      setFormData({ screenshot: "", summary: "", status: "CREATED" });
      setImagePreview("");
      setFileName("");
    }
    setIsLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const clearField = () => {
    setFormData({ screenshot: "", summary: "", status: "CREATED" });
    setImagePreview("");
    setFileName("");
    setErrors({});
  };

  const formControl = `bg-gray-50 border ${
    readonly ? "border-gray-200" : "border-gray-300"
  } text-gray-900 sm:text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-gray-200 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden">
        {/* Header with Back Button */}
        <div className="relative">
          <button
            onClick={() => window.history.back()}
            className="absolute top-4 left-4 p-2 bg-blue-100 backdrop-blur-sm rounded-full shadow transition transform hover:scale-105 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <FaLeftLong className="h-6 w-6 text-blue-700" />
            <span className="sr-only">Go back</span>
          </button>
          <div className="p-8 border-b border-gray-200 text-center">
            <h2 className="text-3xl font-bold text-gray-800">Ticket Form</h2>
            <p className="mt-2 text-gray-600">
              {id ? "Update your ticket below." : "Create a new ticket."}
            </p>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Ticket preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-300 shadow-sm transition transform hover:scale-105"
                    onError={(e) => {
                      e.target.src =
                        "https://placehold.co/600x400?text=Invalid+Image";
                    }}
                  />
                  {errors.screenshot && (
                    <p className="mt-2 text-red-500 text-sm flex items-center gap-1">
                      <FaExclamationCircle className="h-4 w-4" />
                      {errors.screenshot}
                    </p>
                  )}
                </div>
              )}

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {id && (
                  <div className="md:col-span-2">
                    <FormField
                      label="Ticket ID"
                      value={id}
                      className="bg-gray-100 text-gray-500"
                      disabled
                    />
                  </div>
                )}

                {/* File Upload */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Screenshot
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={readonly}
                      />
                      <div className={formControl}>
                        <FaUpload className="inline-block mr-2 h-5 w-5" />
                        {fileName || "Upload file"}
                      </div>
                    </label>
                    {fileName && (
                      <span className="text-sm text-gray-500 truncate">
                        {fileName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="md:col-span-1">
                  <FormField
                    label="Status"
                    type="select"
                    value={formData.status}
                    options={STATUS_OPTIONS}
                    onChange={(e) => handleChange("status", e.target.value)}
                    error={errors.status}
                    className={formControl}
                    disabled={readonly}
                  />
                </div>

                {/* Summary Textarea */}
                <div className="md:col-span-2">
                  <FormField
                    label="Summary"
                    type="textarea"
                    value={formData.summary}
                    error={errors.summary}
                    onChange={(e) => handleChange("summary", e.target.value)}
                    className={formControl}
                    placeholder="Describe the issue in detail..."
                    disabled={readonly}
                    required
                  />
                </div>

                {/* Date Fields */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    label="Created Date"
                    value={formatDate(createDate)}
                    className={formControl}
                    disabled
                  />
                  <FormField
                    label="Updated Date"
                    value={formatDate(updateDate)}
                    className={formControl}
                    disabled
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          {!readonly && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  clearField();
                  onClear();
                }}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-gray-300"
                disabled={isLoading}
              >
                <FaTrash className="h-5 w-5" />
                Clear Form
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={isLoading}
              >
                {id ? (
                  <>
                    <FaPencil className="h-5 w-5" />
                    Update Ticket
                  </>
                ) : (
                  <>
                    <FaPlusCircle className="h-5 w-5" />
                    {isLoading ? "Creating..." : "Create Ticket"}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Validation Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <FaExclamationCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="text-red-800 font-semibold">
                  Validation errors occurred
                </h3>
                <p className="text-red-700 text-sm mt-1">
                  Please fix the highlighted fields before submitting
                </p>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
