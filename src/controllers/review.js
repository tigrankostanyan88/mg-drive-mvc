const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const redis = require("../utils/redisClient");

const DB = require('../models');
const user = require("../models/user");
const { Review } = DB.models;

// CREATE Review
const addReview = catchAsync(async (req, res, next) => {

    if (!rating) return next(new AppError("Rating is required", 400));

    // Check duplicate (1 review per user)
    const existing = await Review.findOne({ where: { user_id: 12 } });

    if (existing) return next(new AppError("Արդեն վերանայվել է", 400));

    const reviews = await Review.create(req.body);

    await redis.del("reviews:all");

    res.status(201).json({
        status: "success",
        reviews
    });
});

// GET Reviews
const getReviews = catchAsync(async (req, res, next) => {
    const cacheKey = "reviews:all";

    // Cached?
    const cached = await redis.get(cacheKey);
    if (cached) {
        return res.json({
            status: "success",
            fromCache: true,
            data: { reviews: JSON.parse(cached) }
        });
    }

    const reviews = await Review.findAll({
        order: [["id", "DESC"]]
    });

    // Save to cache
    await redis.set(cacheKey, JSON.stringify(reviews), { EX: 60 });

    res.json({
        status: "success",
        fromCache: false,
        data: { reviews }
    });
});

// UPDATE Review
const updateReview = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(id);
    if (!review) return next(new AppError("Not found", 404));

    if (review.user_id !== req.user.id)
        return next(new AppError("Forbidden", 403));

    await review.update({
        rating: rating || review.rating,
        comment: comment || review.comment
    });

    // CLEAR CACHE
    await redis.del("reviews:all");

    res.json({
        status: "success",
        data: { review }
    });
});

module.exports = {
    addReview,
    getReviews,
    updateReview
};
