import Booking from "../models/Booking.js";
import Tutor from "../models/Tutor.js";

// CREATE BOOKING (WITH VALIDATION)
export const createBooking = async (req, res) => {
  try {

    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can book" });
    }

    const { tutorId, date, time, price } = req.body;

    const existing = await Booking.findOne({
      tutorId,
      date,
      time,
    });

    if (existing) {
      return res.status(400).json({
        message: "Slot already booked",
      });
    }

    const tutor = await Tutor.findById(tutorId);

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found",
      });
    }

    if (
      tutor.availability &&
      tutor.availability.length > 0 &&
      !tutor.availability.includes(time)
    ) {
      return res.status(400).json({
        message: "Tutor not available at this time",
      });
    }

    // 🔥 FIXED (MOST IMPORTANT)
    // const booking = await Booking.create({
    //   ...req.body,
    //   userId: req.user.id,
    //   tutorId: tutorId,
    //   price: price,
    // });
    const booking = await Booking.create({
  tutorId,
  userId: req.user.id,
  date,
  time,
  price,          // 🔥 MUST
  isPaid: false,  // 🔥 INIT
});

    res.json(booking);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET RECORDING
export const getRecording = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // 🔥 FIX: get tutor profile
    const tutor = await Tutor.findById(booking.tutorId);

    // 🔥 FIXED ACCESS CHECK
    if (
      booking.userId.toString() !== req.user.id &&
      (!tutor || tutor.userId.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ recordingUrl: booking.recordingUrl });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BOOKINGS (USER ONLY)
// export const getBookings = async (req, res) => {
//   try {
//     const bookings = await Booking.find({
//       userId: req.user.id,
//       // tutorId: Tutor._id,
//     });

//     res.json(bookings);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const getBookings = async (req, res) => {
  try {
    // 🧑‍🎓 STUDENT
    if (req.user.role === "student") {
      const bookings = await Booking.find({
        userId: req.user.id,
      });
      return res.json(bookings);
    }

    // 👨‍🏫 TUTOR
    if (req.user.role === "tutor") {
      const tutor = await Tutor.findOne({
        userId: req.user.id,
      });

      if (!tutor) {
        return res.status(404).json({
          message: "Tutor not found",
        });
      }

      const bookings = await Booking.find({
        tutorId: tutor._id,
        isPaid: true, // 🔥 IMPORTANT
      }).populate("userId", "name email");

      return res.json(bookings);
    }

    res.json([]);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADD RECORDING (ONLY TUTOR)
// export const addRecording = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({ message: "Booking not found" });
//     }

//     const tutor = await Tutor.findById(booking.tutorId);

//     // 🔥 FIXED
//     if (!tutor || tutor.userId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     booking.recordingUrl = req.body.recordingUrl;
//     await booking.save();

//     res.json(booking);

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

export const addRecording = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    const tutor = await Tutor.findById(booking.tutorId);

    if (!tutor || tutor.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    booking.recordingUrl = req.body.recordingUrl;
    await booking.save();

    res.json(booking);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE BOOKING (STUDENT OR TUTOR)
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const tutor = await Tutor.findById(booking.tutorId);

    // 🔥 FIX: allow both student & tutor
    if (
      booking.userId.toString() !== req.user.id &&
      (!tutor || tutor.userId.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await booking.deleteOne();

    res.json({ message: "Booking cancelled" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESCHEDULE (ONLY STUDENT)
export const rescheduleBooking = async (req, res) => {
  try {
    const { newTime } = req.body;

    if (!newTime) {
      return res.status(400).json({ message: "New time required" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const exists = await Booking.findOne({
      tutorId: booking.tutorId,
      date: booking.date,
      time: newTime,
      _id: { $ne: booking._id },
    });

    if (exists) {
      return res.status(400).json({
        message: "Slot already booked",
      });
    }

    booking.time = newTime;
    await booking.save();

    res.json(booking);

  } catch (err) {
    console.error("Reschedule Error:", err);
    res.status(500).json({ message: err.message });
  }
};