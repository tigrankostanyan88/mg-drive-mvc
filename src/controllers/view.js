// Models
const DB = require('../models');

const { Test, Group, User, Review } =  DB.models;

module.exports = {
    getHome: async (req, res) => {
        const users = await User.findAll({ include: 'files' },
            { where: { role: 'team-member' } },
        );

        const reviews = await Review.findAll();

        res.render('client/index', {
            title: 'Գլխավոր',
            // page: req.url,
            users,
            reviews
            // nav_active: 'home'
        })
    },
    getTests: async (req, res) => {
        const test = await Test.findAll();

        res.render('client/pages/test', {
            title: 'Թեստեր',
            nav_active: 'test',
            page: req.url,
            test
        })
    },
    getGroups: async (req, res) => {
      
        const group = await Group.findAll();

        res.render('client/pages/groups', {
            title: `Խմբեր`,
            nav_active: 'groups',
            page: req.url,
            group
        })
    },
    getGroup: async (req, res) => {
      
        const group = await Group.findOne({
            where: { id: req.params.id }
        });

        res.render('client/pages/group_details', {
            title: `Խումբ - ${req.params.id}`,
            nav_active: 'groups',
            page: req.url,
            group
        })
    },
    getTestDetails: async (req, res) => {
        // const test = await Test.findByPk(req.params.id, {
        //     include: 'questions'
        // });
        const test = await Test.findOne({
            include: 'questions',
            where: { id: req.params.id }
        });

        res.render('client/pages/test_details', {
            title: 'Թեստ',
            nav_active: 'test',
            page: req.url,
            test
        })
    },
    getLogin: async (req, res) => {
        res.render('client/pages/login', {
            title: 'Մուտք',
            nav_active: 'login',
            page: req.url
        })
    }
}