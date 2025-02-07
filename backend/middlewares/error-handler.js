import { constants } from "../utils/constants.js";

export const errorHandler = (err, req, res, next) => {
  // Determine the status code, defaulting to 500 if not set
  const statusCode = res.statusCode ? res.statusCode : 500;

  // If headers are already sent, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle different status codes with appropriate error messages
  switch (statusCode) {
    case constants.NOT_FOUND:
      res.status(statusCode).json({ error: true, message: "Not Found" });
      break;
    case constants.INTERNAL_SERVER_ERROR:
      console.error(err);
      res
        .status(statusCode)
        .json({ error: true, message: "Internal Server Error" });
      break;
    // Handle other status codes as needed
    case constants.FORBIDDEN:
      res.status(statusCode).json({ error: true, message: "Forbidden" });
      break;
    case constants.UNAUTHORIZED:
      res.status(statusCode).json({ error: true, message: "Unauthorized" });
      break;
    case constants.CONFLICT:
      res.status(statusCode).json({ error: true, message: "Conflict" });
      break;
    case constants.BAD_REQUEST:
      res.status(statusCode).json({ error: true, message: "Bad Request" });
      break;
    case constants.CREATED:
      res.status(statusCode).json({ success: true, message: "Created" });
      break;
    case constants.NO_CONTENT:
      res.status(statusCode).json({ success: true, message: "No Content" });
      break;
    default:
      //   Log a message if no error status code matches
      console.error(`No Error dictated by errorHandler: ${statusCode}`);
      break;
  }
};
