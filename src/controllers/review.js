const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// sequelize models

const DB = require('../models');
const { Review, File } = DB.models;

// 🟢 CREATE Review
// CREATE Review
const addReview = catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;
    const user_id = req.user.id;


    // Validate required fields
    if (!rating) {
      return next(new AppError("Rating and deviceId are required", 400));
    }

    // Prevent duplicate reviews (optional: one review per user per device)
     const existingReview = await Review.findOne({
      where: { user_id: user_id }
    });

    if (existingReview) {
      return next(new AppError("You have already left a comment.", 400));
    }

    // Create review safely
    const review = await Review.create({
      name: req.user.name,
      rating,
      comment,
      user_id: user_id,
    });

    res.status(201).json({
      status: "success",
      data: {
        review,
      },
    });
});

// 🟡 GET Reviews (by id or all for device)
const getReviews = catchAsync(async (req, res, next) => {
  const {
    id
  } = req.user;
  const {
    deviceId
  } = req.query;

  if (id) {
    const review = await Review.findByPk(id, {
      // include: [
      //   { model: User, as: "user", attributes: ["id", "name"] },
      //   { model: Device, as: "device", attributes: ["id", "name"] }
      // ]
    });
    if (!review) return next(new AppError("Review not found", 404));
    return res.json({
      status: "success",
      data: {
        review
      }
    });
  }

  let where = {};
  if (deviceId) where.deviceId = deviceId;

  const reviews = await Review.findAll({
    where,
    // include: { model: User, as: "user", attributes: ["id", "name"] }
  });

  res.json({
    status: "success",
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// 🔵 UPDATE Review
const updateReview = catchAsync(async (req, res, next) => {
  const {
    id
  } = req.params;
  const {
    rating,
    comment
  } = req.body;

  const review = await Review.findByPk(id);
  if (!review) return next(new AppError("Review not found", 404));

  // only owner can update
  if (review.userId !== req.user.id) {
    return next(new AppError("You are not allowed to update this review", 403));
  }

  review.rating = rating || review.rating;
  review.comment = comment || review.comment;

  await review.save();

  res.json({
    status: "success",
    data: {
      review
    }
  });
});

module.exports = {
  addReview,
  getReviews,
  updateReview
};