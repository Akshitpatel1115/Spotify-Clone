const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(`${process.env.DB_CONNECTION_STRING}/SpotifyClone`);
    console.log('Database connected successfuly.')
  } catch (err) {
    console.error("Database connection error:", err);
  }
}

module.exports = connectDB;
