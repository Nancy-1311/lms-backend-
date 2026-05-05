import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs"; 
import authRoutes from "./routes/authRoutes.js";
import tutorRoutes from "./routes/tutorRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import paymentHistoryRoutes from "./routes/paymentHistoryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import connectDB from "./config/db.js";
import User from "./models/User.js"; 

const app = express();

app.use(
  cors({
    origin: [
      "https://lms-frontend-puce-gamma.vercel.app",
      "http://localhost:3000"
    ],
    credentials: true
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment-history", paymentHistoryRoutes);
app.use("/api/admin", adminRoutes);

const createAdmin = async () => {
  try {
    const exists = await User.findOne({ email: "admin@test.com" });

    if (!exists) {
      const hashedPassword = await bcrypt.hash("123456", 10);

      await User.create({
        name: "Nancy",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin",
      });

      console.log("✅ Admin created");
    } else {
      console.log("⚠️ Admin already exists");
    }
  } catch (err) {
    console.error(err);
  }
};

connectDB().then(() => {
  createAdmin();
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
