import { google } from "googleapis";
import nodemailer from "nodemailer";

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

export const sendEmail = async (
  email,
  first_name,
  emailText,
  verificationToken
) => {
  // Send verification email
  const path = `${process.env.BASE_URL}/verify-email/${verificationToken}`;

  try {
    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token;
    if (!accessToken) {
      throw new Error("Failed to get access token");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "umunwa30@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "umunwa30@gmail.com",
      to: email,
      subject: `Greetings ${first_name}`,
      html:
        emailText ||
        `Hello there! Welcome to our website. Your account has been created successfully.
      <br>Click <a href="${path}">here</a> to verify your email. Link expires in 1 hour.`,
    };
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Error sending email: ${error.message}`);
  }
};
