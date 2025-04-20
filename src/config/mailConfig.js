// backend/config/mailConfig.js
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in", // or smtp.zoho.com for global
  port: 465,
  secure: true,
  auth: {
    user: "info@berachahacademy.com",
    pass: "AmFcaaY938xC" // your Zoho App Password
  }
});


export default transporter;
