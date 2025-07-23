const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const upload = require('./config/multer');


dotenv.config();
const app = express();
app.use(cors({
    origin:process.env.ALLOWED_ORIGIN 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    });

app.post('/', upload.single('pdf'),async (req, res) => {
  console.log('hello')
  let { data } = req.body;
  data = JSON.parse(data);
    const {topic} = req.query;




  // 1. Build full HTML document
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

 
   
    
 const mailOptions = {
  from: process.env.GMAIL_USER,
  to: process.env.RECEIVER_EMAIL,
  subject: `${topic} from ${data.name || 'Someone'}`,
  html: htmlContent,
  attachments: req.file
    ? [
        {
          filename: `${data.name}_${Date.now()}.${req.file.originalname.split('.').pop()}`,
          content: req.file.buffer,
        },
      ]
    : [],
};
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'Email sent successfully with PDF.' });
    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({ success: false, message: 'Failed to send email.' });
    }
  
});


app.get('/', (req, res) => {
  res.send('Welcome to the YF Enterprises Server!');
}
);
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
