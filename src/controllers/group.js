const DB = require("../models");
const redis = require("../utils/redisClient");
const AppError = require("../utils/appError");

const { Group, Question, File } = DB.models;

// ---------------------- GET ALL GROUPS ----------------------
exports.getGroups = async (req, res) => {
    try {
        const limit = 20;
        const page = Number(req.query.page || 1);
        const offset = (page - 1) * limit;

        const cacheKey = `groups:page=${page}:limit=${limit}`;

        // --- CHECK CACHE ---
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                status: "success",
                fromCache: true,
                time: `${Date.now() - req.time} ms`,
                groups: JSON.parse(cached)
            });
        }

        // --- DB QUERY ---
        const groupsRaw = await Group.findAll({
            limit,
            offset,
            order: [["number", "ASC"]],
            attributes: ["id", "title", "number", "slug", "date"],

            include: [
                {
                    model: Question,
                    as: "questions",
                    attributes: ["id", "question"],
                    separate: true,
                    order: [["id", "ASC"]],
                    include: [
                        {
                            model: File,
                            as: "files",
                            attributes: ["id", "path"],
                            separate: true
                        }
                    ]
                }
            ]
        });

        const groups = groupsRaw.map(g => g.get({ plain: true }));

        // --- SAVE TO CACHE ---
        await redis.set(cacheKey, JSON.stringify(groups), { EX: 20 });

        res.status(200).json({
            status: "success",
            fromCache: false,
            time: `${Date.now() - req.time} ms`,
            groups
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};


// ---------------------- GET ONE GROUP ----------------------
exports.getGroup = async (req, res, next) => {
    try {
        const group = await Group.findByPk(req.params.id, {
            attributes: ["id", "title", "number", "slug", "date"],
            include: [
                {
                    model: Question,
                    as: "questions",
                    attributes: ["id", "title", "question"],
                    include: [
                        {
                            model: File,
                            as: "files",
                            attributes: ["id", "path"]
                        }
                    ]
                }
            ]
        });

        if (!group) return next(new AppError("Group not found!", 404));

        res.status(200).json({
            status: "success",
            time: `${Date.now() - req.time} ms`,
            group
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};


// ---------------------- CREATE GROUP ----------------------
exports.addGroup = async (req, res) => {
    try {
        const group = await Group.create(req.body);

        await redis.flushAll(); // clear cache

        res.status(201).json({
            status: "success",
            time: `${Date.now() - req.time} ms`,
            group
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};


// ---------------------- UPDATE GROUP ----------------------
exports.updateGroup = async (req, res, next) => {
    try {
        const group = await Group.findByPk(req.params.id);

        if (!group) return next(new AppError("Group not found.", 404));

        await group.update(req.body);

        await redis.flushAll();

        res.status(200).json({
            status: "success",
            time: `${Date.now() - req.time} ms`,
            group
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error!" });
    }
};


// ---------------------- DELETE GROUP ----------------------
exports.deleteGroup = async (req, res) => {
    const t = await DB.con.transaction();

    try {
        const questions = await Question.findAll({
            where: { row_id: req.params.id, row_type: "group" },
            transaction: t
        });

        if (questions.length > 0) {
            const ids = questions.map(q => q.id);

            await File.destroy({ where: { row_id: ids }, transaction: t });
            await Question.destroy({ where: { id: ids }, transaction: t });
        }

        const deleted = await Group.destroy({
            where: { id: req.params.id },
            transaction: t
        });

        if (!deleted) {
            await t.rollback();
            return res.status(404).json({ message: "Group not found" });
        }

        await t.commit();

        await redis.flushAll();

        res.status(204).json({ message: "Deleted successfully!" });

    } catch (err) {
        console.error(err);
        await t.rollback();
        res.status(500).json({ message: "Internal server error!" });
    }
};