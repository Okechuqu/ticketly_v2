import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    screenshot: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          // Allow empty values
          if (!v) return true;
          // Accept if it's a data URL or a valid http(s) URL
          return (
            v.startsWith("data:image/") ||
            v.startsWith("http://") ||
            v.startsWith("https://")
          );
        },
        message: (props) => `${props.value} is not a valid image file!`,
      },
    },
    summary: {
      type: String,
      required: true,
      minlength: 10,
    },
    status: {
      type: String,
      required: true,
      enum: ["CREATED", "IN_PROGRESS", "REJECTED", "COMPLETED"],
      default: "CREATED",
    },
    created_by: {
      type: String,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

export default Ticket;
