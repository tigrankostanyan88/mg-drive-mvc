const AppError = require("../utils/appError");
const groupService = require('../services/group.service');

// ---------------------- GET ALL GROUPS ----------------------
exports.getGroups = async (req, res) => {
    try {
        const page = Number(req.query.page || 1);
        const limit = 20;
        const { groups, fromCache } = await groupService.listPaged(page, limit);
        res.status(200).json({
            status: "success",
            fromCache,
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
        const group = await groupService.getById(req.params.id);
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
        const group = await groupService.create(req.body);
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
        const group = await groupService.update(req.params.id, req.body);
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
    try {
        await groupService.remove(req.params.id);
        res.status(204).json({ message: "Deleted successfully!" });
    } catch (err) {
        if (err instanceof AppError && err.statusCode === 404) {
            return res.status(404).json({ message: "Group not found" });
        }
        res.status(500).json({ message: "Internal server error!" });
    }
};
