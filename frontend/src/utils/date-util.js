// Function to ensure a number is at least 2 digits by padding with leading zeros if necessary
const make2Digits = (num) => {
  return num.toString().padStart(2, "0");
};

// Function to format a Date object into a string in the format YYYY-MM-DD
export const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    // Check if the input is a valid Date object
    throw new Error("Invalid date");
  }
  return [
    date.getFullYear(), // Get the full year (YYYY)
    make2Digits(date.getMonth() + 1), // Get the month (MM), adding 1 because getMonth() returns 0-11
    make2Digits(date.getDate()), // Get the day of the month (DD)
  ].join("-"); // Join the parts with hyphens
};
