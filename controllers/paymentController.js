import Stripe from "stripe";
import dotenv from "dotenv";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import Tutor from "../models/Tutor.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CREATE CHECKOUT
export const createCheckoutSession = async (req, res) => {
  try {
    const { name, price, bookingId, tutorId } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: name,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
     success_url: `https://lms-frontend-puce-gamma.vercel.app/success?bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "https://lms-frontend-puce-gamma.vercel.app/cancel",
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// SAVE PAYMENT + UPDATE BOOKING
export const confirmPayment = async (req, res) => {
  try {
    const { bookingId, session_id } = req.body;

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(400).json({ message: "Invalid session" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.isPaid) {
      return res.json({ message: "Already paid" });
    }

    const payment = await Payment.create({
      userId: req.user.id,
      tutorId: booking.tutor,
      bookingId,

      amount: session.amount_total / 100,

      transactionId: session.payment_intent,
      stripeSessionId: session.id,

      paymentMethod: session.payment_method_types[0],
      status: session.payment_status === "paid" ? "paid" : "pending",

      paidAt: new Date(session.created * 1000),
    });

  
    booking.isPaid = true;
    booking.paymentStatus = "paid";
    booking.paymentId = payment._id; 

    await booking.save();

    res.json({ message: "Payment confirmed" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getTutorEarnings = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ userId: req.user.id });

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found",
      });
    }

    // ONLY PAID BOOKINGS + POPULATE STUDENT + TUTOR
    const bookings = await Booking.find({
      tutor: tutor._id,
      isPaid: true,
    })
      .populate("student", "name email")
      .populate({
        path: "tutor",
        populate: {
          path: "userId",
          select: "name",
        },
      })
      .lean();

    // FORMAT DATA 
    const payments = bookings.map((b) => ({
      _id: b._id,
      amount: b.price,

      student: b.student,

      //ADD TUTOR NAME
      tutor: {
        name: b.tutor?.userId?.name,
      },

      subject: b.subject,
      time: b.time,
      createdAt: b.date,

      status: "paid",
    }));

    const totalEarnings = bookings.reduce(
      (sum, b) => sum + (b.price || 0),
      0
    );

    res.json({
      totalEarnings,
      totalLessons: bookings.length,
      payments,
    });

  } catch (err) {
    console.error("Earnings Error:", err);
    res.status(500).json({ message: err.message });
  }
};  

// GET MY PAYMENTS
export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user.id,
    })
      .populate({
        path: "bookingId",
        select: "subject date time tutorName",
      })
      .populate("userId") 
      .populate({
        path: "tutorId",
        populate: {
          path: "userId",
        },
      });

    const formatted = payments.map((p) => ({
      _id: p._id,

      //  WHO PAID
      paidBy:
        p.userId?.name ||
        p.userId?.username ||
        p.userId?.email ||
        "Unknown User",

      // TUTOR NAME
      tutorName:
        p.tutorId?.userId?.name ||
        p.tutorId?.userId?.username ||
        p.bookingId?.tutorName ||
        p.tutorName ||
        "Tutor",

      // SUBJECT
      subject:
        p.bookingId?.subject ||
        "No Subject",

      price: p.amount,

      date:
        p.bookingId?.date ||
        p.date,

      time:
        p.bookingId?.time ||
        "No Time",

      isPaid: true,

      transactionId: p.transactionId || "N/A",
      paymentMethod: p.paymentMethod || "Card",
      status: p.status || "Success",
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
