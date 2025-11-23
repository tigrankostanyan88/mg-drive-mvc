const DB = require('../models');
const { User, File } = DB.models;

const redis = require('../utils/redisClient');
const Files = require("./File");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


// ---------------------- GET ALL USERS ----------------------
exports.getUsers = catchAsync(async (req, res) => {
    const cacheKey = "users:all";

    // --- CHECK CACHE ---
    const cached = await redis.get(cacheKey);
    if (cached) {
        return res.status(200).json({
            status: "success",
            fromCache: true,
            time: `${Date.now() - req.time} ms`,
            users: JSON.parse(cached)
        });
    }

    // --- DB QUERY ---
    const usersRaw = await User.findAll({
        attributes: ["id", "name", "email"],
        order: [["id", "ASC"]],
        include: [
            {
                model: File,
                as: "files",
            }
        ]
    });

    const users = usersRaw.map(u => u.get({ plain: true }));

    // --- STORE IN CACHE ---
    await redis.set(cacheKey, JSON.stringify(users), { EX: 20 });

    res.status(200).json({
        status: "success",
        fromCache: false,
        time: `${Date.now() - req.time} ms`,
        users
    });
});

// ---------------------- UPDATE USER ----------------------
exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.params.id, {
            include: "files"
        });

        if (!user) return next(new AppError("User not found.", 404));

        // UPDATE FIELDS
        for (let key in req.body) user[key] = req.body[key];
        await user.save();

        // HANDLE FILE UPLOAD
        if (req.files?.user_img) {
            const img = await new Files(user, req.files.user_img).replace("user_img");
            if (img.status === "success") {
                await user.createFile(img.table);
            } else {
                return next(new AppError(Object.values(img.message).join(" "), 400));
            }
        }

        // CLEAR ONLY USERS CACHE
        await redis.del("users:all");

        res.status(200).json({
            status: "success",
            time: `${Date.now() - req.time} ms`,
            user,
            redirect: "reload"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};

exports.updateMe = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: "files"
        });

        if (!user) return next(new AppError("User not found.", 404));

        for (let key in req.body) user[key] = req.body[key];
        await user.save();

        if (req.files?.user_img) {
            const img = await new Files(user, req.files.user_img).replace("user_img");
            if (img.status === "success") {
                await user.createFile(img.table);
            } else {
                return next(new AppError(Object.values(img.message).join(" "), 400));
            }
        }

        // ONLY DELETE THE USERS CACHE
        await redis.del("users:all");

        res.status(200).json({
            status: "success",
            time: `${Date.now() - req.time} ms`,
            user,
            redirect: "reload"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};
