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
            users,
            reviews,
            nav_active: 'home'
        })
    },
    getTests: async (req, res) => {
        const test = await Test.findAll();

        res.render('client/pages/test', {
            title: 'Թեստեր',
            nav_active: 'tests',
            page: req.url,
            test
        })
    },
    getGroups: async (req, res) => {
        res.render('client/pages/groups', {
            title: `Խմբեր`,
            nav_active: 'groups',
            page: req.url,
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
    getProfile: async (req, res) => {

        res.render('client/pages/user-profile', {
            nav_active: 'profile',
            page: req.url,
        })
    },
    getProfileHistory: async (req, res) => {

        res.render('client/parts/profile-history', {
            nav_active: 'history',
            page: req.url,
        })
    },
    getProfileOptions: async (req, res) => {
        res.render('client/parts/profile-options', {
            nav_active: 'options',
            page: req.url,
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