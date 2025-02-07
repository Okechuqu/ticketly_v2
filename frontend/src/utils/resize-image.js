// src/utils/resize-image.js

/**
 * Resize an image file using an offscreen canvas.
 *
 * @param {File} file - The image file to resize.
 * @param {number} maxWidth - Maximum allowed width (in pixels).
 * @param {number} maxHeight - Maximum allowed height (in pixels).
 * @returns {Promise<string>} - A promise that resolves with the resized image as a base64 data URL.
 */
export const resizeImage = (file, maxWidth = 1024, maxHeight = 1024) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        // Calculate the scaling ratio while keeping aspect ratio intact.
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
        const width = img.width * ratio;
        const height = img.height * ratio;

        // Create an offscreen canvas and set its dimensions.
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        // Draw the image into the canvas with the new dimensions.
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert the canvas content to a base64-encoded data URL.
        const dataUrl = canvas.toDataURL(file.type);
        resolve(dataUrl);
      };

      img.onerror = (error) => {
        reject(new Error("Error loading image for resizing"));
      };

      img.src = event.target.result;
    };

    reader.onerror = (error) => {
      reject(new Error("Error reading file"));
    };

    // Read the file as a Data URL
    reader.readAsDataURL(file);
  });
};
