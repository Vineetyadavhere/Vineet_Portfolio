import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, email, mobile, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Configure your SMTP transporter here
      // For this to work, the user needs to provide SMTP_USER and SMTP_PASS in .env
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER || 'vineetyadavhere@gmail.com',
          pass: process.env.SMTP_PASS, // App Password for Gmail
        },
      });

      const mailOptions = {
        from: process.env.SMTP_USER || 'vineetyadavhere@gmail.com',
        to: 'vineetyadavhere@gmail.com',
        subject: `New Inquiry from ${name} via Portfolio`,
        text: `
          Name: ${name}
          Email: ${email}
          Mobile: ${mobile || 'Not provided'}
          
          Message:
          ${message}
        `,
      };

      // Only attempt to send if credentials are provided
      if (process.env.SMTP_PASS) {
        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "Email sent successfully" });
      } else {
        // Log for development if no pass provided
        console.log("--- New Contact Form Submission ---");
        console.log(mailOptions.text);
        res.json({ 
          success: true, 
          message: "Submission received (Dev Mode: Logged to console as SMTP_PASS is missing)" 
        });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
