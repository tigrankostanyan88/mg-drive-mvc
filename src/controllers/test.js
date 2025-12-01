const DB = require('../models');
const redis = require('../utils/redisClient');
const AppError = require('../utils/appError');
const helpers = require('../utils/helpers');
const testService = require('../services/test.service');

// ------- GET ALL TESTS -------
exports.getTests = async (req, res) => {
    try {
        const limit = 20;
        const page = Number(req.query.page || 1);
        const { tests, fromCache } = await testService.listPaged(page, limit);
        res.status(200).json({
            status: "success",
            fromCache,
            helpers,
            time: `${Date.now() - req.time} ms`,
            tests
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};

// ------- GET ONE TEST -------
exports.getTest = async (req, res, next) => {
    try {
        const test = await testService.getById(req.params.id);
        res.status(200).json({
            status: "success",
            time: `${Date.now() - req.time} ms`,
            test
        });
    } catch (err) {
        if (err instanceof AppError && err.statusCode === 404) {
            return next(err);
        }
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};

// ------- CREATE TEST -------
exports.addTest = async (req, res) => {
    try {
        const test = await testService.create(req.body);
        await redis.flushAll();
        res.status(201).json({
            status: "success",
            time: `${Date.now() - req.time} ms`,
            test
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};

// ------- UPDATE TEST -------
exports.updateTest = async (req, res, next) => {
    try {
        const test = await testService.update(req.params.id, req.body);
        await redis.flushAll();
        res.status(200).json({
            status: "success",
            time: `${Date.now() - req.time} ms`,
            test
        });
    } catch (err) {
        if (err instanceof AppError && err.statusCode === 404) {
            return next(err);
        }
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};

// ------- DELETE TEST -------
exports.deleteTest = async (req, res) => {
    try {
        await testService.remove(req.params.id);
        await redis.flushAll();
        res.status(204).json({ message: "Deleted successfully!" });
    } catch (err) {
        if (err instanceof AppError && err.statusCode === 404) {
            return res.status(404).json({ message: "Test not found" });
        }
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};
