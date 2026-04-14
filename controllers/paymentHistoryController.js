import Payment from "../models/Payment.js";

// SAVE PAYMENT
export const savePayment = async (req, res) => {
  try {
    const payment = await Payment.create({
      ...req.body,
      userId: req.user.id,
    });

    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ONLY USER PAYMENTS
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user.id,
    });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};