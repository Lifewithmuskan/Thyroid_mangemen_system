const mongoose = require("mongoose")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/thyroid_management"

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log(
      "MongoDB connected successfully to:",
      MONGODB_URI.includes("localhost") ? "Local Database" : "Cloud Database",
    )
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

connectDB()

module.exports = mongoose.connection
