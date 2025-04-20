import express from "express";
import transporter from "../config/mailConfig.js";

const router = express.Router();

// Define the mail sending route
router.post("/send-mail", (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: "info@berachahacademy.com",
    to: "info@berachahacademy.com",
    subject: `New Message from ${name}`,
    html: `<p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Mail error:", error);
      return res.status(500).send("Mail not sent");
    } else {
      console.log("Mail sent:", info.response);
      return res.status(200).send("Mail sent successfully");
    }
  });
});

export default router;
