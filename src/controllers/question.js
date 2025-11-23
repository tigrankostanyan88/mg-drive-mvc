const DB = require('../models');
const {
    Question,
    File,
    Test,
    Group
} = DB.models;
const AppError = require('./../utils/appError');
const Files = require("./File");

module.exports = {
    addQuestion: async (req, res, next) => {
        try {
            const questionData = req.body;

            if (req.body.row_id === '') {
                return next(new AppError("Պարտադիր ընտրեք <b>թեստ</b> կամ <b>խումբ</b>, որի մեջ հարցը եք ավելացնում։",403));
            }

            const question = await Question.create(questionData);

            const addedQuestion = await Question.findByPk(question.id, {
                include: 'files'
            });

            if (req.files && req.files.question_img) {

                const image = await new Files(addedQuestion, req.files.question_img).replace("question_img");
                console.log(image.status, '⚠️')

                if (image.status === "success") {
                    await addedQuestion.createFile({
                        ...image.table,
                        row_id: question.id,
                    });
                } else {
                    await question.destroy();
                    return next(new AppError(
                        Object.values(image.message).join(" "),
                        400
                    ));
                }
            } else {
                console.log('No image uploaded');
            }

            res.status(201).json({
                status: 'success',
                time: `${Date.now() - req.time} ms`,
                question
            });

        } catch (error) {
            console.error('Error adding question:', error);
            res.status(500).json({
                message: 'Internal server error!',
                error: error.message
            });
        }
    },
    getQuestions: async (req, res) => {
        try {
            const questions = await Question.findAll({
                attributes: ["id", "question", "row_id", "table_name", "options", "correctAnswerIndex"],
            });

            // Preload tests + groups
            const tests = await Test.findAll({
                attributes: ["id", "title", "number"]
            });
            const groups = await Group.findAll({
                attributes: ["id", "title", "number"]
            });

            // Convert to dictionary for fast lookup
            const testMap = Object.fromEntries(tests.map(t => [t.id, t]));
            const groupMap = Object.fromEntries(groups.map(g => [g.id, g]));


            // Attach polymorphic relations
            questions.forEach(q => {
                if (q.table_name === "tests") {
                    q.dataValues.test = testMap[q.row_id] || null;
                }
                if (q.table_name === "groups") {
                    q.dataValues.group = groupMap[q.row_id] || null;
                }
            });
            res.status(200).json({
                status: 'success',
                time: `${Date.now() - req.time}ms`,
                questions
            });

        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: 'Internal server error!'
            });
        }
    },
    getQuestion: async (req, res) => {
        try {
            res.status(201).json({
                status: 'success',
                time: `${Date.now() - req.time} - ms`,
            })

        } catch (e) {
            res.status(500).json({
                message: 'Interval server error!'
            })
        }
    },
    updateQuestion: async (req, res) => {
        try {
            const question = await Question.findByPk(req.params.id, {
                include: "files"
            });

            if (!question) return next(new AppError('question is not found.', 404));

            for (key in req.body) question[key] = req.body[key];
            await question.save();

            if (req.files) {
                if (req.files.question_img) {
                    let questionImg = await new Files(question, req.files.question_img).replace("question_img");

                    if (questionImg.status == "success") {
                        // create row
                        await question.createFile(questionImg.table);
                    } else {
                        return next(
                            new AppError(Object.values(questionImg.message).join(" "), 400)
                        );
                    }
                }
            }

            res.status(201).json({
                status: 'success',
                time: (Date.now() - req.time) + " ms",
                question
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                message: 'Interval server error!'
            })
        }
    },
    deleteQuestion: async (req, res) => {
        const question = await Question.findOne({
            where: {
                id: req.params.id
            }
        });
        const file = await File.findOne({
            where: {
                row_id: question.id
            }
        });

        if (!question) return next(new AppError('Question not found.'));

        else await question.destroy();
        if (file) await file.destroy();

        res.status(203).json({
            message: 'Հաջողությամբ ջնջվեց!',
            redirect: '/admin/questions'
        });
    }
}