import { FaLeftLong } from "react-icons/fa6";
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
    <div>
      <button
        onClick={() => window.history.back() && window.location.reload()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-2"
      >
        <FaLeftLong />
      </button>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {isLoading ? (
          <div className="my-4 flex justify-center">
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
            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Ticket screenshot"
                  className="w-full h-48 object-contain bg-gray-100"
                  onError={(e) => {
                    e.target.src =
                      "https://placehold.co/600x400?text=Invalid+Image";
                  }}
                />
              </div>
            )}
            {errors.screenshot && (
              <p className="text-red-500 text-sm mt-1">{errors.screenshot}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {id && (
                <FormField
                  label="Ticket ID"
                  value={id}
                  className={formControl}
                  disabled
                />
              )}
              <FormField
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                label="Screenshot"
                className={formControl}
                disabled={readonly}
              />
              {fileName && (
                <p className="text-gray-600 text-sm">Selected: {fileName}</p>
              )}
              <FormField
                label="Summary"
                type="textarea"
                value={formData.summary}
                error={errors.summary}
                onChange={(e) => handleChange("summary", e.target.value)}
                className={formControl}
                placeholder="Enter detailed description..."
                disabled={readonly}
                required
              />
              <FormField
                label="Status"
                type="select"
                value={formData.status}
                options={STATUS_OPTIONS}
                onChange={(e) => handleChange("status", e.target.value)}
                className={formControl}
                error={errors.status}
                disabled={readonly}
              />
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
        )}

        {!readonly && (
          <div className="flex gap-4 justify-center mt-6">
            <button
              type="button"
              onClick={() => {
                clearField();
                onClear();
              }}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              {id
                ? "Update Ticket"
                : isLoading
                ? "Creating Ticket"
                : "Create Ticket"}
            </button>
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            Please fix the validation errors before submitting
          </div>
        )}
      </form>
    </div>
  );
};

export default TicketForm;
