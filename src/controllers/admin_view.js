// Models
const DB = require('../models');
const Sequelize = require('sequelize');

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const helpers = require('../utils/helpers');

const {Test, Group, Question, File, User, Registration } = DB.models;
const { Op } = DB.Sequelize;

// async function attachQuestions(items) {
//   for (const item of items) {
//     const questions = await Question.findAll({
//       where: { row_id: item.id }
//     });
//     item.dataValues.question = questions;
//   }
// }

async function getAdminData() {
  const [tests, users, groups, questions] = await Promise.all([
    Test.findAll({ raw: true }),
    User.findAll({ raw: true }),
    Group.findAll({ raw: true }),
    Question.findAll({ raw: true }),
  ]);

  return { tests, users, groups, questions};
}

module.exports = {
    getAdmin: async (req, res) => {
        // const tests = await Test.findAll();
        const { tests, users, groups, questions } = await getAdminData();

        const testQuestions = await Question.findAll({where: {row_type: "test"}})
        const groupQuestions = await Question.findAll({where: {row_type: "group"}})

        res.render('admin/layouts/default', {
            title: 'գլխավոր',
            nav_active: "home",
            tests,
            testQuestions,
            groupQuestions,
            questions,
            groups,
            helpers,
            users,
            url: req.url
        });
    },
    getQuestion: async (req, res) => {
        try {
            const questions = await Question.findAll();
           res.render('admin/pages/question', {
                title: 'Խմբեր',
                nav_active: "home",
                questions,
                url: req.url
            });


        } catch(e) {
            res.status(500).json({
                message: 'Interval server error!'
            })
        }
    },
    getTests: async (req, res) => {
        res.render('admin/pages/tests', {
            title: 'Թեստեր',
            nav_active: "test",
        })
    },
    getTest: async (req, res) => {
        try {
            const test = await Test.findByPk(req.params.id);

            const questions = await Question.findAll({
                where: { row_id: "test", row_id: test.id },
            });

            const questionPromise = questions.map(async (question) => {
                const files = await File.findAll({
                    where: {
                        name_used: "question_img",
                        row_id: question.id,
                    }
                });
                question.dataValues.files = files;
            });

            await Promise.all(questionPromise);
            test.questions = questions;

            res.render('admin/pages/test', {
                title: 'Թեստ',
                nav_active: "test",
                test,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Սխալ տեղի ունեցավ');
        }
    },
    getStudents: async (req, res) => {
        try {
           const students = await User.findAll({
                where: {
                    role: 'student'
                }
           });

            res.render('admin/pages/students', {
                title: 'ՈՒսանողներ',
                nav_active: "students",
                students,
                helpers
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Սխալ տեղի ունեցավ');
        }
    },
    getUsers: async (req, res) => {
        try {

            const { Op } = require('sequelize');

            const users = await User.findAll({
                where: {
                    role: { [Op.notIn]: ['admin', 'student'] }
                },
                include: 'files'
            });

            res.render('admin/pages/users', {
                title: 'Օգտատերեր',
                nav_active: "students",
                users,
                helpers
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Սխալ տեղի ունեցավ');
        }
    },
    getRegistration: async (req, res) => {
        try {

            const { Op } = require('sequelize');

            const registedUser = await Registration.findAll();

            res.render('admin/pages/registration', {
                title: 'Գրանցված Օգտատերեր',
                nav_active: "students",
                registedUser: registedUser,
                helpers
            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Սխալ տեղի ունեցավ');
        }
    },
    getGroups: async (req, res) => {
        res.render('admin/pages/groups', {
            title: `Խմբեր`,
            nav_active: 'group',
            page: req.url,
        })
    },
    getReviews: async (req, res) => {
        const group = await Group.findAll();
        res.render('admin/pages/reviews', {
            title: `Մեկնաբանություններ`,
            nav_active: 'group',
            page: req.url,
        })
    },
    getGroup: async (req, res) => {
        const group = await Group.findByPk(req.params.id, { include: 'questions' });

        const questions = await Question.findAll({
            // where: { name_used: "group", row_id: group.id, }
        });

        const questionPromise = questions.map(async (question) => {
            const files = await File.findAll({
                where: {
                    // name_used: "question_img",
                    // row_id: question.id,
                }
            });
            question.dataValues.files = files;
        });

        await Promise.all(questionPromise);
        group.questions = questions;

        res.render('admin/pages/group', {
            title: `Խմբեր`,
            nav_active: 'group',
            page: req.url,
            group
        })
    },
    updateTestQuestion: async (req, res) => {
        let tests = await Test.findAll({
            include: 'questions'
        });
        let groups = await Group.findAll();
        res.render('admin/pages/updateTestQuestion', {
            title: 'Թեստերի հացրեր',
            page: req.url,
            nav_active: "update_test",
            tests,
            groups
        })
    },
    updateGroupQuestion: async (req, res) => {
        let tests = await Test.findAll({
            include: 'questions'
        });
        let groups = await Group.findAll();
        res.render('admin/pages/updateGroupQuestion', {
            title: 'խմբերի հարցեր',
            page: req.url,
            nav_active: "update_group",
            tests,
            groups
        })
    }
}