const mongoose = require("mongoose");
require("dotenv").config();

const userSchema = new mongoose.Schema({
  data: { type: Object, required: true },
  attachment: {
    filename: String, // File name
    data: Buffer, // File buffer data
    contentType: String, // MIME type (e.g., 'application/pdf')
  },
  url: String, // URL for accessing the file
  topic: String,
  createdAt: { type: Date, default: Date.now },
});

// Hook to set the file URL before saving
userSchema.pre("save", function (next) {
  if (this.attachment) {
    // Assuming this._id will be available after document is saved
    this.url = `${process.env.SERVER_URL}/file/${this._id.toString()}`;

  }
  next();
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
