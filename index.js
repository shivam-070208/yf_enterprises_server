const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const upload = require("./config/multer");
const connectDb = require("./config/connectDb");
const fs = require("fs/promises");
const path = require("path");
const UserModel = require("./models/User");  // Assuming your schema is defined here
const mongoose = require("mongoose");

dotenv.config();
connectDb();

const app = express();
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

app.post("/", upload.single("pdf"), async (req, res) => {
  let { data } = req.body;

  // Parse data if it's a string (i.e., from a form submission)
  if (typeof data !== "object") data = JSON.parse(data);
  const { topic } = req.query;

  // 1. Build full HTML document for the email content
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Contact Message</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        table { border-collapse: collapse; width: 100%; }
        td, th { border: 1px solid #ddd; padding: 8px;  }
        th { background: #773fe7ec; color: white; text-align: left; }
      </style>
    </head>
    <body>
      <h2>${topic} Form Submission</h2>
      <table>
        ${Object.entries(data).map(([key, value]) =>
          `<tr><th>${key}</th><td>${value}</td></tr>`
        ).join('')}
      </table>
    </body>
    </html>`;

  // Mail options (email with attachment)
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.RECEIVER_EMAIL,
    subject: `${topic} from ${data.name || 'Someone'}`,
    html: htmlContent,
    attachments: req.file
      ? [
          {
            filename: `${data.name}_${Date.now()}.${req.file.originalname.split('.').pop()}`,
            content: req.file.buffer, // Store the file buffer here
          },
        ]
      : [],
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    // 2. Save file buffer directly into MongoDB (no file system interaction)
    const fileExtension = path.extname(req.file?.originalname);
    const fileName = `${Date.now()}${fileExtension}`;

    // Here, we're assuming the "UserModel" schema has a "fileData" field to store the file buffer
    await UserModel.create({
      data, 

      attachment: req.file?{
        filename: fileName,
        data: req.file.buffer,  // Store the file buffer directly in MongoDB
        contentType: req.file.mimetype,
      }:{},
      topic,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully with PDF.",
    });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});
app.get("/file/:fileId", async (req, res) => {
  try {
    const { fileId } = req.params;

    // Find the file using its _id in the UserModel collection
    const userRecord = await UserModel.findById(fileId);

    if (!userRecord || !userRecord.attachment) {
      return res.status(404).json({ message: "File not found" });
    }

    // Send the file as a response
    res.setHeader("Content-Type", userRecord.attachment.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${userRecord.attachment.filename}`
    );
    res.send(userRecord.attachment.data);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ message: "Error fetching file" });
  }
});

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to the YF Enterprises Server!");
});

// Start the server
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
