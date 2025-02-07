import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    display_picture: {
      type: String,
      default: null,
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
    role: {
      type: String,
      default: "client",
      enum: ["admin", "agent", "client"],
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationExpires: Date,
    resetToken: String,
    resetExpires: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
