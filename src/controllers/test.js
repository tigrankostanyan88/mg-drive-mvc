const DB = require('../models');
const redis = require('../utils/redisClient');
const AppError = require('../utils/appError');
const helpers = require('../utils/helpers');

const { Test, Question, File } = DB.models;

// ------- GET ALL TESTS -------
exports.getTests = async (req, res) => {
    try {
        const limit = 20;
        const page = Number(req.query.page || 1);
        const offset = (page - 1) * limit;

        const cacheKey = `tests:page=${page}:limit=${limit}`;

        // --- CHECK CACHE ---
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                status: "success",
                fromCache: true,
                time: `${Date.now() - req.time} ms`,
                tests: JSON.parse(cached)
            });
        }

        // --- DB QUERY ---
        const testsRaw = await Test.findAll({
            limit,
            offset,
            order: [["number", "ASC"]],
            attributes: ["id", "title", "number", "number", "updatedAt"],

            include: [
                {
                    model: Question,
                    as: "questions",
                    attributes: ["id", "question"],
                    separate: true,
                    order: [["id", "ASC"]],
                    limit: 10,
                    include: [
                        {
                            model: File,
                            as: "files",
                            attributes: ["id"],
                            separate: true,
                            limit: 5
                        }
                    ]
                }
            ]
        });

        const tests = testsRaw.map(t => t.get({ plain: true }));

        // --- CACHE SAVE ---
        await redis.set(cacheKey, JSON.stringify(tests), { EX: 20 });

        res.status(200).json({
            status: "success",
            fromCache: false,
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
        const test = await Test.findByPk(req.params.id, {
            attributes: ["id", "title", "number", "slug"],
            include: [
                {
                    model: Question,
                    as: "questions",
                    attributes: ["id", "title", "question"],
                    include: [{
                        model: File,
                        as: "files",
                        attributes: ["id", "path"]
                    }]
                }
            ]
        });

        if (!test) return next(new AppError("Test not found!", 404));

        res.status(200).json({
            status: "success",
            time: `${Date.now() - req.time} ms`,
            test
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};

// ------- CREATE TEST -------
exports.addTest = async (req, res) => {
    try {
        const test = await Test.create(req.body);

        // Clear cache because tests changed
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
        const test = await Test.findByPk(req.params.id);

        if (!test) return next(new AppError("Test not found!", 404));

        await test.update(req.body);
        await redis.flushAll();

        res.status(200).json({
            status: "success",
            time: `${Date.now() - req.time} ms`,
            test
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};

// ------- DELETE TEST -------
exports.deleteTest = async (req, res) => {
    const t = await DB.con.transaction();

    try {
        const questions = await Question.findAll({
            where: { row_id: req.params.id, table_name: "tests" },
            transaction: t
        });

        if (questions.length > 0) {
            const ids = questions.map(q => q.id);

            await File.destroy({ where: { row_id: ids }, transaction: t });
            await Question.destroy({ where: { id: ids }, transaction: t });
        }

        const deleted = await Test.destroy({
            where: { id: req.params.id },
            transaction: t
        });

        if (!deleted) {
            await t.rollback();
            return res.status(404).json({ message: "Test not found" });
        }

        await t.commit();
        await redis.flushAll(); // Clear cache
        res.status(204).json({ message: "Deleted successfully!" });

    } catch (err) {
        console.error(err);
        await t.rollback();
        res.status(500).json({ message: "Internal server error!" });
    }
};
