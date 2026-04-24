  import Tutor from "../models/Tutor.js";
  import Booking from "../models/Booking.js";
  import User from "../models/User.js";


  export const getTutors = async (req, res) => {
    try {
      //  ONLY APPROVED + ACTIVE TUTORS
      const tutors = await Tutor.find({
        isApproved: true,   // 🔥 IMPORTANT FIX
        isActive: true,     // already in your model
      }).populate("userId");

      // KEEP YOUR EXISTING FILTER 
      const filteredTutors = tutors.filter(
        (t) => t.userId && t.userId.isActive !== false
      );

      res.json(filteredTutors);

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
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
      const user = await User.findById(req.user.id); 

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



  export const deleteMyTutorProfile = async (req, res) => {
    try {
      //  ONLY ADMIN
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

  export const getTutorDashboard = async (req, res) => {
    try {
      const tutor = await Tutor.findOne({ userId: req.user.id });

      if (!tutor) {
        return res.status(404).json({
          message: "Tutor not found",
        });
      }

      //ONLY PAID BOOKINGS
      const bookings = await Booking.find({
        tutor: tutor._id,
        isPaid: true,
      }).populate("student", "name email");

      const now = new Date();

      let upcoming = 0;
      let completed = 0;

      //  DATE + TIME LOGIC
      bookings.forEach((b) => {
        const bookingDateTime = new Date(`${b.date} ${b.time}`);

        if (b.meetingLink) completed++;
  else upcoming++;
      });

      // TOTAL EARNINGS
      const totalEarnings = bookings.reduce(
        (sum, b) => sum + (b.price || 0),
        0
      );

      //  UNIQUE STUDENTS COUNT
      const uniqueStudents = new Set(
        bookings.map((b) => b.student?._id.toString())
      );

      res.json({
        total: bookings.length,
        upcoming,
        completed,

        // NEW FIELDS
        totalEarnings,
        totalStudents: uniqueStudents.size,

        bookings,
      });

    } catch (err) {
      console.error("Dashboard Error:", err);
      res.status(500).json({ message: err.message });
    }
  };

  