import Review from "../models/Review.js";
import Tutor from "../models/Tutor.js";
import Booking from "../models/Booking.js";

// CREATE REVIEW (WITH VALIDATION)
export const createReview = async (req, res) => {
  try {
    const { tutorId, rating, comment } = req.body;

    if (!tutorId || rating === undefined) {
      return res.status(400).json({
        message: "tutorId and rating are required",
      });
    }

    const numericRating = Number(rating);

    if (isNaN(numericRating)) {
      return res.status(400).json({
        message: "Rating must be a number",
      });
    }

    //  CHECK USER HAS BOOKED THIS TUTOR
    const booking = await Booking.findOne({
      tutorId,
      userId: req.user.id,
    });

    if (!booking) {
      return res.status(403).json({
        message: "You can only review after booking",
      });
    }

// PREVENT MULTIPLE REVIEWS
    const existingReview = await Review.findOne({
      tutorId,
      userId: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You already reviewed this tutor",
      });
    }

    
    const review = await Review.create({
      tutorId,
      userId: req.user.id,
      rating: numericRating,
      comment,
    });

  
    booking.reviewed = true;
    await booking.save();

    // UPDATE AVERAGE RATING
    const reviews = await Review.find({ tutorId });

    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) /
      reviews.length;

    await Tutor.findByIdAndUpdate(tutorId, {
      rating: Number(avgRating.toFixed(1)),
    });

    res.json(review);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET REVIEWS BY TUTOR
export const getReviewsByTutor = async (req, res) => {
  try {
    const reviews = await Review.find({
      tutorId: req.params.tutorId,
    });

    res.json(reviews);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MY REVIEWS
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      userId: req.user.id,
    });

    res.json(reviews);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};