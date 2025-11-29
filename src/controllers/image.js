const DB = require('../models');
const {Op } = DB.Sequelize;
const { File } = DB.models;
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const redis = require('../utils/redisClient');

module.exports = {
    deleteImage: catchAsync(async (req, res, next) => {
        const file = await File.findOne({ where: { id: req.params.id } });

        if (!file) return next(new AppError('Gallery not found.', 404));

        await file.destroy(); 
        if(file && file.table_name === 'gallery') {
            await redis.del('gallery:all');
        }
        
        res.status(200).json({
            message: 'Gallery and associated files deleted successfully!'
        })
    })
}
