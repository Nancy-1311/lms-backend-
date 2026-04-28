import User from "../models/User.js";
import Tutor from "../models/Tutor.js"; 
import Booking from "../models/Booking.js";
import Review from "../models/Review.js";
import bcrypt from "bcryptjs";

// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const tutors = await Tutor.find();

    const usersWithTutor = users.map((u) => {
const tutor = tutors.find(
  (t) => t.userId?.toString() === u._id.toString()
);
      return {
        ...u.toObject(),
        tutor: tutor || null,
      };
    });

    res.json(usersWithTutor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await User.findByIdAndDelete(userId);

    await Tutor.findOneAndDelete({ student: userId });

    res.json({ message: "User deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE USER STATUS
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    await Tutor.findOneAndUpdate(
      { student: user._id },
      { isActive: user.isActive }
    );

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CHANGE USER ROLE
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (role !== "tutor") {
      await Tutor.findOneAndDelete({ student: userId });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN DASHBOARD
export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "student" });
    const totalTutors = await Tutor.countDocuments();
    const totalBookings = await Booking.countDocuments({ isPaid: true });

    const revenueData = await Booking.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" }
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      totalUsers,
      totalTutors,
      totalBookings,
      totalRevenue,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ANALYTICS
export const getAdminAnalytics = async (req, res) => {
  try {
    const revenue = await Booking.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$price" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const bookings = await Booking.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const monthlyRevenue = revenue.map((r) => ({
      month: months[r._id - 1],
      revenue: r.revenue,
    }));

    const monthlyBookings = bookings.map((b) => ({
      month: months[b._id - 1],
      bookings: b.bookings,
    }));

    res.json({
      monthlyRevenue,
      monthlyBookings,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BOOKINGS
export const getAdminBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("student", "name email")
      .populate({
        path: "tutor",
        populate: {
          path: "userId", 
          select: "name"
        }
      });

    res.json(bookings);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// APPROVE TUTOR
export const approveTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    tutor.isApproved = true;
    tutor.approvalStatus = "approved";

    await tutor.save();

    res.json({ message: "Tutor approved ✅" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REJECT TUTOR
export const rejectTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    tutor.isApproved = false;
    tutor.approvalStatus = "rejected";

    await tutor.save();

    res.json({ message: "Tutor rejected ❌" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTopTutors = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $match: { isPaid: true } },

      {
        $group: {
          _id: "$tutor",
          totalEarned: { $sum: "$price" },
          totalBookings: { $sum: 1 },
        },
      },

      { $sort: { totalEarned: -1 } },

      {
        $lookup: {
          from: "tutors",
          localField: "_id",
          foreignField: "_id",
          as: "tutor",
        },
      },

      { $unwind: "$tutor" },

      { $limit: 5 },
    ]);

    res.json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name email")
      .populate({
        path: "tutorId",
        populate: {
          path: "userId",
          select: "name",
        },
      });

    res.json(reviews);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await review.deleteOne();

    res.json({ message: "Review deleted successfully ❌" });
  } catch (err) {
    console.error("Delete review error:", err);
    res.status(500).json({ message: err.message });
  }
};


export const createUserByAdmin = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    // ✅ TRIM
    name = name?.trim();
    email = email?.trim().toLowerCase();
    password = password?.trim();

    // ✅ REQUIRED CHECK
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ✅ EMAIL FORMAT
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // ✅ PASSWORD LENGTH
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // ✅ ROLE CHECK
    const validRoles = ["student", "tutor", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role selected",
      });
    }

    // ✅ DUPLICATE USER
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
