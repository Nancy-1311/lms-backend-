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

      success_url: `https://learning-management-system-frontend-gules.vercel.app/success?bookingId=${bookingId}&price=${price}&tutorId=${tutorId}`,
      cancel_url: "https://learning-management-system-frontend-gules.vercel.app/cancel",
    });

    res.json({ url: session.url });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  SAVE PAYMENT + UPDATE BOOKING
export const confirmPayment = async (req, res) => {
  try {
    const { bookingId, price } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.isPaid) {
      return res.json({ message: "Already paid" });
    }

    booking.isPaid = true;
    booking.paymentStatus = "completed";
    await booking.save();

// SAVE PAYMENT
    await Payment.create({
      userId: req.user.id,
      tutorId: booking.tutorId,
      bookingId,
      tutorName: booking.tutorName,
      amount: price,
    });

    res.json({ message: "Payment confirmed" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET TUTOR EARNINGS
export const getTutorEarnings = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ userId: req.user.id });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const payments = await Payment.find({ tutorId: tutor._id })
      .populate("userId", "name email"); 

    const totalEarnings = payments.reduce(
      (acc, p) => acc + p.amount,
      0
    );

    res.json({
      totalEarnings,
      totalLessons: payments.length,
      payments,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user.id,
    });

    res.json(payments);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};