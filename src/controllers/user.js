const DB = require('../models');
const { User, File } = DB.models;
const Files = require("./File");

// Module exports a function that acts as an error handler
const catchAsync = require('./../utils/catchAsync');

module.exports = {
    getUsers: catchAsync(async (req, res) => {
        // 3) Update user
        const user = await User.findAll({
            include: "files",
            order: [ ["id", "ASC"] ],
            attributes: ['name', 'email']
        });

        res.status(200).json({
            user,
            current: req.user,
            time: (Date.now() - req.time) + ' ms'
        });
    }),
    updateUser: async (req, res) => {
        try {
            
            const user = await User.findByPk(req.params.id, {
                include: "files"
            });

            if (!user) return next(new AppError('user is not found.', 404));

            for (key in req.body) user[key] = req.body[key];
            await user.save();

            if (req.files) {
                if (req.files.user_img) {
                    let userImg = await new Files(user, req.files.user_img).replace("user_img");

                    if (userImg.status == "success") {
                        // create row
                        await user.createFile(userImg.table);
                    } else {
                        return next(
                            new AppError(Object.values(userImg.message).join(" "), 400)
                        );
                    }
                }
            }

            res.status(201).json({
                status: 'success',
                time: (Date.now() - req.time) + " ms",
                user,
                redirect: 'reload'
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Interval server error!'
            })
        }
    },
}