import Tutor from "../models/Tutor.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";

// GET ALL
// export const getTutors = async (req, res) => {
//   try {
//     const tutors = await Tutor.find();
//     res.json(tutors);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const getTutors = async (req, res) => {
  try {
    // ✅ populate user data
    const tutors = await Tutor.find().populate("userId");

    // 🔥 FILTER: remove deleted / inactive users
    const filteredTutors = tutors.filter(
      (t) => t.userId && t.userId.isActive !== false
    );

    res.json(filteredTutors);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE
export const createTutor = async (req, res) => {
  try {
    const existing = await Tutor.findOne({ userId: req.user.id });

    if (existing) {
      return res.status(400).json({
        message: "Tutor profile already exists",
      });
    }

    if (req.body.price && req.body.price < 0) {
      return res.status(400).json({
        message: "Invalid price",
      });
    }

    const tutor = await Tutor.create({
      ...req.body,
      userId: req.user.id,
    });

    res.json(tutor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MY PROFILE
export const getMyTutorProfile = async (req, res) => {
  try {
    let tutor = await Tutor.findOne({ userId: req.user.id });
    const user = await User.findById(req.user.id); // ✅ FIXED

    if (!tutor) {
      tutor = await Tutor.create({
        userId: req.user.id,
        name: user.name,
        subject: "",
        price: 0,
        availability: [],
      });
    }

    if (tutor.name === "New Tutor") {
      tutor.name = user.name;
      await tutor.save();
    }

    res.json(tutor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateMyTutorProfile = async (req, res) => {
  try {
    if (req.body.price && req.body.price < 0) {
      return res.status(400).json({
        message: "Invalid price",
      });
    }

    if (req.body.expertise) {
      req.body.subject = req.body.expertise;
    }

    const tutor = await Tutor.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );

    res.json(tutor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
// export const deleteMyTutorProfile = async (req, res) => {
//   try {
//     await Tutor.findOneAndDelete({ userId: req.user.id });
//     res.json({ message: "Deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const deleteMyTutorProfile = async (req, res) => {
  try {
    // 🔒 ONLY ADMIN
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can delete tutor",
      });
    }

    const tutor = await Tutor.findByIdAndDelete(req.params.id);

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found",
      });
    }

    res.json({ message: "Tutor deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN UPDATE PRICE
export const updateTutorPrice = async (req, res) => {
  try {
    const { price } = req.body;

    if (!price || price < 0) {
      return res.status(400).json({
        message: "Invalid price",
      });
    }

    const tutor = await Tutor.findOneAndUpdate(
      { userId: req.params.id },
      { price },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found",
      });
    }

    res.json(tutor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DASHBOARD
export const getTutorDashboard = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ userId: req.user.id });

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found",
      });
    }

    // 🔥 ONLY PAID BOOKINGS
    const bookings = await Booking.find({
      tutorId: tutor._id,
      isPaid: true,
    }).populate("userId", "name email");

    console.log("PAID BOOKINGS:", bookings); // ✅ DEBUG

    const now = new Date();

    let upcoming = 0;
    let completed = 0;

    bookings.forEach((b) => {
      const date = new Date(b.date);
      if (date > now) upcoming++;
      else completed++;
    });

    res.json({
      total: bookings.length,
      upcoming,
      completed,
      bookings,
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ message: err.message });
  }
};