const DB = require('../models');
const { Test, Group, User, Review } = DB.models;
const { buildSEO } = require('../services/seo');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

module.exports = {
    getHome: async (req, res) => {
        const users = await User.findAll({
            where: { role: 'team-member' },
            include: 'files'
        });

        const reviews = await Review.findAll();

        res.render('client/index', {
            ...buildSEO(req),
            users,
            reviews,
            nav_active: 'home'
        });
    },

    getTests: async (req, res) => {
        const test = await Test.findAll();

        res.render('client/pages/test', {
            ...buildSEO(req, {
                title: 'Թեստեր - Ավտոդպրոց Արթիկ',
                description: 'Անցեք վարորդական իրավունքի թեստերը՝ ऑनलाइन, անվճար և ժամանակաչափով։'
            }),
            nav_active: 'tests',
            page: req.path,
            test
        });
    },

    getGroups: async (req, res) => {
        res.render('client/pages/groups', {
            ...buildSEO(req, {
                title: 'Խմբեր - Ավտոդպրոց Արթիկ',
                description: 'Դիտեք ընթացող և առաջիկա խմբերի ժամանակացույցը և availability–ը։'
            }),
            nav_active: 'groups',
            page: req.path,
        });
    },

    getGroup: async (req, res) => {
        const group = await Group.findByPk(req.params.id);

        res.render('client/pages/group_details', {
            ...buildSEO(req, {
                title: `Խումբ ${group?.title || ''} - Ավտոդպրոց Արթիկ`,
                description: `Մանրամասն տեղեկատվություն խմբի մասին՝ ժամեր, գներ, մնացած տեղեր։`
            }),
            nav_active: 'groups',
            page: req.path,
            group
        });
    },

    getProfile: async (req, res) => {
        res.render('client/pages/user-profile', {
            ...buildSEO(req, {
                title: 'Անձնական Պրոֆիլ',
                description: 'Ձեր հաշվապահական տվյալները, պատմությունը և կարգավորումները։'
            }),
            nav_active: 'profile',
            page: req.path
        });
    },

    getInfoDetails: async (req, res) => {
        res.render('client/pages/profile-info', {
            ...buildSEO(req, {
                title: 'Անձնական Տվյալներ',
                description: 'Փոխեք ձեր անձնական տվյալները՝ անուն, հեռախոս, email։'
            }),
            nav_active: 'info',
            page: req.path
        });
    },

    getProfileHistory: async (req, res) => {
        res.render('client/pages/profile-history', {
            ...buildSEO(req, {
                title: 'Իմ Պատմությունը',
                description: 'Տեսեք ձեր անցկացրած դասերը և թեստավորումների պատմությունը։'
            }),
            nav_active: 'history',
            page: req.path
        });
    },

    getProfileOptions: async (req, res) => {
        res.render('client/pages/profile-options', {
            ...buildSEO(req, {
                title: 'Կարգավորումներ',
                description: 'Պրոֆիլի և ծանուցումների կարգավորումները։'
            }),
            nav_active: 'options',
            page: req.path
        });
    },

    getTestDetails: async (req, res) => {
        const test = await Test.findOne({
            include: 'questions',
            where: { id: req.params.id }
        });

        res.render('client/pages/test_details', {
            ...buildSEO(req, {
                title: `Թեստ - ${test?.title}`,
                description: `Վարորդական իրավունքի փորձնական թեստ՝ ${test?.title} թեմայով։`
            }),
            nav_active: 'test',
            page: req.path,
            test
        });
    },

    // --- Dynamic Sitemap ---
    generateSitemap: async (req, res) => {
        try {
            const tests = await Test.findAll({ attributes: ['id'] });
            const groups = await Group.findAll({ attributes: ['id'] });

            const links = [
                { url: '/', changefreq: 'weekly', priority: 1 },
                { url: '/tests', changefreq: 'weekly', priority: 0.9 },
                { url: '/groups', changefreq: 'monthly', priority: 0.8 },
                ...tests.map(t => ({
                    url: `/tests/${t.id}`,
                    changefreq: 'monthly',
                    priority: 0.7
                })),
                ...groups.map(g => ({
                    url: `/groups/${g.id}`,
                    changefreq: 'monthly',
                    priority: 0.7
                }))
            ];

            const stream = new SitemapStream({
                hostname: `${req.protocol}://${req.get('host')}`
            });

            const xml = await streamToPromise(
                Readable.from(links).pipe(stream)
            ).then(sm => sm.toString());

            res.header('Content-Type', 'application/xml');
            res.send(xml);
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    },

    getLogin: async (req, res) => {
        res.render('client/pages/login', {
            ...buildSEO(req, {
                title: 'Մուտք',
                description: 'Մուտք գործեք անձնական հաշվին։'
            }),
            nav_active: 'login',
            page: req.path
        });
    }
};
