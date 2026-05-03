import Review from "../models/Review.js";
import Tutor from "../models/Tutor.js";
import Booking from "../models/Booking.js";

export const createReview = async (req, res) => {
  try {
    const { tutorId, bookingId, rating, comment } = req.body;

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

    //booking uses tutorId + userId
    const booking = await Booking.findOne({
      _id: bookingId,
      tutor: tutorId,
      student: req.user.id,   
    });

    if (!booking) {
      return res.status(403).json({
        message: "You can only review after booking",
      });
    }

    // use tutorId + userId
    const existingReview = await Review.findOne({
      bookingId: bookingId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You already reviewed this tutor",
      });
    }

    const review = await Review.create({
      bookingId: bookingId,
      tutorId: tutorId,
      userId: req.user.id,
      rating: numericRating,
      comment,
    });

    booking.reviewed = true;
    await booking.save();

    const reviews = await Review.find({ tutorId: tutorId });

    const avgRating =
      reviews.reduce((acc, r) => acc + r.rating, 0) /
      reviews.length;

    await Tutor.findByIdAndUpdate(tutorId, {
      rating: Number(avgRating.toFixed(1)),
    });

    res.json(review);

  } catch (err) {
    console.error("CREATE REVIEW ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
// GET REVIEWS BY TUTOR
export const getReviewsByTutor = async (req, res) => {
  try {
    const reviews = await Review.find({
     tutorId: new mongoose.Types.ObjectId(req.params.tutorId),
    }).populate("userId", "name");

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



