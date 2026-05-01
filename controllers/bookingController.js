import Booking from "../models/Booking.js";
import Tutor from "../models/Tutor.js";

export const createBooking = async (req, res) => {
  try {

    if (!req.user || req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can book" });
    }

    const { tutorId, date, time, price } = req.body;
    
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0);

    //SAME TUTOR + SAME TIME
    const tutorBooking = await Booking.findOne({
      tutor: tutorId, 
      time,
      date: {
        $gte: bookingDate,
        $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (tutorBooking) {
      return res.status(400).json({
        message: "This tutor is already booked at this time",
      });
    }

    // SAME STUDENT + SAME TIME
    const userBooking = await Booking.findOne({
      student: req.user.id, 
      time,
      date: {
        $gte: bookingDate,
        $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (userBooking) {
      return res.status(400).json({
        message: "You already have a booking at this time",
      });
    }

    const tutor = await Tutor.findById(tutorId);

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found",
      });
    }

if (!tutor.isApproved) {
  return res.status(400).json({
    message: "Tutor not approved yet ⏳",
  });
}
    const normalizedTime = time.trim().toLowerCase();

    const isAvailable = tutor.availability?.some(
      (slot) => slot.trim().toLowerCase() === normalizedTime
    );

    if (!isAvailable) {
      return res.status(400).json({
        message: "Tutor not available at this time",
      });
    }

    const booking = await Booking.create({
      student: req.user.id,
      tutor: tutorId,
      tutorName: tutor.name,
      subject: tutor.subject,
      date,
      time,
      price,
    });

    res.json(booking);

  } catch (err) {

    if (err.code === 11000) {
      return res.status(400).json({
        message: "This time slot is already booked",
      });
    }

    res.status(500).json({ message: err.message });
  }
};

export const getRecording = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const tutor = await Tutor.findById(booking.tutor);

    if (
      booking.student.toString() !== req.user.id &&
      (!tutor || tutor.userId.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const now = new Date();
const classDate = new Date(booking.date);
const [time, modifier] = booking.time.split(" ");
let [hours, minutes] = time.split(":");

if (modifier === "PM" && hours !== "12") {
  hours = parseInt(hours) + 12;
}
if (modifier === "AM" && hours === "12") {
  hours = 0;
}

classDate.setHours(hours, minutes);

if (now < classDate) {
  return res.status(400).json({
    message: "Class not completed yet",
  });
}

    if (!booking.recordingUrl) {
      return res.status(400).json({
        message: "Recording not available yet",
      });
    }

    res.json({ recordingUrl: booking.recordingUrl });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    // ✅ STUDENT
    if (req.user.role === "student") {
      const bookings = await Booking.find({
        student: req.user.id,
        isPaid: true,
      })
        .populate({
          path: "tutor",
          populate: {
            path: "userId",
            select: "name email",
          },
        })
        .lean();

      const fixedBookings = bookings.map((b) => ({
        ...b,
        recordingUrl: b.recordingUrl || "",
      }));

      return res.json(fixedBookings);
    }

    // ✅ TUTOR
    if (req.user.role === "tutor") {
      const tutor = await Tutor.findOne({
        userId: req.user.id,
      });

      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      const bookings = await Booking.find({
        tutor: tutor._id,
        isPaid: true,
      })
        .populate("student", "name email")
        .lean();

      const fixedBookings = bookings.map((b) => ({
        ...b,
        recordingUrl: b.recordingUrl || "",
      }));

      return res.json(fixedBookings);
    }

    res.status(400).json({ message: "Invalid role" });

  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const addRecording = async (req, res) => {
  try {
    console.log("BODY:", req.body); // 🔥 DEBUG

    const { recordingUrl } = req.body;

    if (!recordingUrl) {
      return res.status(400).json({
        message: "Recording URL missing ❌",
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const tutor = await Tutor.findById(booking.tutor);

    if (!tutor || tutor.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // ✅ FORCE SAVE VALUE
    booking.recordingUrl = recordingUrl.trim();
    booking.isCompleted = true;

    await booking.save();

    console.log("SAVED:", booking.recordingUrl); // 🔥 DEBUG

    res.json(booking);

  } catch (err) {
    console.error("ADD RECORDING ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const tutor = await Tutor.findById(booking.tutor);

    if (
      booking.student.toString() !== req.user.id &&
      (!tutor || tutor.userId.toString() !== req.user.id)
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 🔴 BLOCK PAST BOOKINGS
    const now = new Date();
    const bookingDateTime = new Date(`${booking.date}T${booking.time}`);

    if (bookingDateTime < now) {
      return res.status(400).json({
        message: "❌ Cannot cancel past booking",
      });
    }

    // ✅ SOFT DELETE
    booking.isCancelled = true;
    booking.cancelledAt = new Date();

    await booking.save();

    res.json({ message: "Booking cancelled successfully" });

  } catch (err) {
    console.error("CANCEL ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

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

    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const exists = await Booking.findOne({
      tutor: booking.tutor,
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

export const addMeetingLink = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const tutor = await Tutor.findById(booking.tutor);

    if (!tutor || tutor.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    booking.meetingLink = req.body.meetingLink;
    await booking.save();

    res.json(booking);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Booking.find({
      student: req.user.id,
      isPaid: true,
    });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN CANCEL BOOKING
export const adminCancelBooking = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne();

    res.json({ message: "Booking cancelled by admin" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN MARK COMPLETED
export const adminMarkCompleted = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.isCompleted = true;
    await booking.save();

    res.json({ message: "Booking marked as completed" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
