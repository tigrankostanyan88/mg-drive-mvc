const DB = require('../models');
const AppError = require('../utils/appError');

const {
    Test,
    Question,
    File
} = DB.models;

function extractNumber(str) {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
}

module.exports = {
    addTest: async (req, res) => {
        try {
            const test = await Test.create(req.body);

            res.status(201).json({
                time: (Date.now() - req.time) + " ms",
                status: 'success',
                test
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Interval server error!'
            })
        }
    },
    getTests: async (req, res) => {
        try {
            const testsRaw = await Test.findAll({
                include: 'questions'
            });

            const tests = testsRaw.map(test => test.get({ plain: true }));
            tests.sort((a, b) => extractNumber(a.title) - extractNumber(b.title));

            res.status(200).json({
                status: 'success',
                time: `${Date.now() - req.time} ms`,
                tests,
            });

        } catch (e) {
            console.error('Error fetching tests:', e);
            res.status(500).json({
                message: 'Internal server error!',
                error: e.message
            });
        }

    },
    getTest: async (req, res, next) => {
        try {
            const test = await Test.findByPk(req.params.id, {
                include: 'questions',
                where: { row_type: 'test' }
            });

            if (!test) return next(new AppError('Test not found!', 404));

            res.status(201).json({
                status: 'success',
                time: `${Date.now() - req.time} - ms`,
                test
            });
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Interval server error!'
            })
        }
    },
    updateTest: async (req, res) => {
        try {
            const test = await Test.findByPk(req.params.id);

            if (!test) return next(new AppError('Category not found.', 404));

            for (key in req.body) test[key] = req.body[key];
            await test.save();

            res.status(200).json({
                status: 'success',
                time: (Date.now() - req.time) + " ms",
                test
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Interval server error!'
            })
        }
    },
    deleteTest: async (req, res) => {
        try {
            // 1. We bring all the questions under this Test
            const questions = await Question.findAll({
                where: { row_id: req.params.id, row_type: 'test' }
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
            const deleted = await Test.destroy({
                where: {
                    id: req.params.id
                }
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