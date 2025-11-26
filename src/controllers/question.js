const DB = require('../models');
const Files = require("./File");
const dbCon = require('../utils/db');
const AppError = require('./../utils/appError');

const { Question, File, Test, Group } = DB.models;
const sequelize = dbCon.con;

module.exports = {
    addQuestion: async (req, res, next) => {

        const t = await sequelize.transaction(); 

        try {
            const questionData = req.body;
            const options = JSON.parse(req.body.options);

            // ---------- VALIDATION ----------
            if (!req.body.row_id) {
                throw new AppError("Պարտադիր ընտրեք <b>թեստ</b> կամ <b>խումբ</b>, որի մեջ հարցը եք ավելացնում։", 403);
            }
            if (!req.body.question) {
                throw new AppError("Հարցի դաշտը չի կարող դատարկ լինել", 403);
            }
            if (!options.length) {
                throw new AppError("Պարտադիր է ավելացնել պատասխաններ", 403);
            }
            if (!req.body.correctAnswerIndex) {
                throw new AppError("Ընտրեք ճիշտ պատասխանը", 403);
            }

            // CREATE QUESTION
            const question = await Question.create(questionData, { transaction: t });

            // IMAGE UPLOA
            if (req.files?.question_img) {

                // OPTIONAL: reload with files 
                await question.reload({ include: "files", transaction: t });

                const image = await new Files(question, req.files.question_img)
                    .replace("question_img");

                if (image.status !== "success") {
                    await t.rollback();
                    return next(new AppError(Object.values(image.message).join(" "), 400));
                }

                // CREATE FILE ROW (polymorphic)
                await question.createFile(
                    { ...image.table, row_id: question.id },
                    { transaction: t }
                );
            }

            // ---------- COMMIT ----------
            await t.commit();

            // Reload full question WITH files AFTER commit
            const fullQuestion = await Question.findByPk(question.id, {
                include: "files"
            });

            return res.status(201).json({
                status: "success",
                time: `${Date.now() - req.time} ms`,
                question: fullQuestion
            });

        } catch (error) {

            if (t) await t.rollback();

            console.error("❌ Error adding question:", error);

            return next(
                error instanceof AppError
                    ? error
                    : new AppError("Internal server error", 500)
            );
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