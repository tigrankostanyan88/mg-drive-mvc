const { where } = require('sequelize');
const DB = require('../models');

const { Group, Question, File } = DB.models;

function extractNumber(str) {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
}

module.exports = {
    addGroup: async (req, res) => {
        try {
            const group = await Group.create(req.body);

            res.status(201).json({
                time: (Date.now() - req.time) + " ms",
                group
            })
        } catch(e) {
            console.log(e);
            res.status(500).json({
                message: 'Interval server error!'
            })
        }
    },
    getGroup: async (req, res) => {
        try {
            const group = await Group.findByPk(req.params.id, { 
                include: 'questions', where: { row_type: 'group'}
            });

            res.status(201).json({
                time: (Date.now() - req.time) + " ms",
                group
            })
        } catch(e) {
            console.log(e);
            res.status(500).json({
                message: 'Interval server error!'
            })
        }
    },
    getGroups: async (req, res) => {
        try {
            const groupsRow = await Group.findAll({
                include: 'questions',
            });

            const groups = groupsRow.map(group => group.get({ plain: true }));
            groups.sort((a, b) => extractNumber(a.title) - extractNumber(b.title));
            
            groups.sort((a, b) => {
                return extractNumber(a.title) - extractNumber(b.title);
            });

            res.status(201).json({
                time: (Date.now() - req.time) + " ms",
                groups
            })
        } catch(e) {
            console.log(e);
            res.status(500).json({
                message: 'Interval server error!'
            })
        }
    },
    updateGroup: async (req, res) => {
        try {
            const group = await Group.findByPk(req.params.id);

            if (!group) return next(new AppError('group not found.', 404));

            for(key in req.body) group[key] = req.body[key];
            await group.save();

            res.status(201).json({
                status: 'success',
                time: (Date.now() - req.time) + " ms",
                group
            })
        } catch(e) {
            console.log(e);
            res.status(500).json({
                message: 'Interval server error!'
            })
        }
    },
    deleteGroup: async (req, res, next) => {
        try {
            // 1. We bring all the questions under this Test
            const questions = await Question.findAll({
                where: { row_id: req.params.id, row_type: 'group' }
            });

            // 2. If there are any questions
            if (questions.length > 0) {
                const questionIds = questions.map(q => q.id);

                // 3. Delete all files whose row_id is one of the question ids.
                const files = await File.findAll({ where: { row_id: questionIds } });

                for (const file of files) {
                    await file.destroy();
                }

                // 4. We are deleting all questions.
                await Question.destroy({
                    where: { id: questionIds }
                });
            }


            // 5. Deleting test
            const deleted = await Group.destroy({
                where: { id: req.params.id }
            });

            if (deleted === 0) {
                return res.status(404).json({
                    message: 'Test not found'
                });
            }

            res.status(204).json({
                message: 'Deleted successfully!'
            });
        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: 'Internal server error!'
            });
        }
    }
}