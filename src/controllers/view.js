// Models
const DB = require('../models');

const { Test, Group, User, Review } =  DB.models;

// SEO Defaults 
const SEO_DEFAULT = {
    title: 'Ավտոդպրոց Արթիկում - Վարորդական Դասընթացներ',
    description: 'Սկսեք վարորդական տարրալույսը ինչպես պատշաճ է՝ պրոֆեսիոնալ տեսական և գործնական դասերով',
    og_image: '/client/images/share-logo.jpg'
};

// Helper to build SEO data
const buildSEO = (req, overrides = {}) => ({
    title: overrides.title || SEO_DEFAULT.title,
    description: overrides.description || SEO_DEFAULT.description,
    canonical: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    og_image: `${req.protocol}://${req.get('host')}${overrides.og_image || SEO_DEFAULT.og_image}`
});


module.exports = {
    getHome: async (req, res) => {
        const users = await User.findAll({ include: 'files' },
            { where: { role: 'team-member' } },
        );

        const reviews = await Review.findAll();

        res.render('client/index', {
            ...buildSEO(req),
            users,
            reviews,
            nav_active: 'home'
        })
    },
    getTests: async (req, res) => {
        const test = await Test.findAll();

        res.render('client/pages/test', {
            ...buildSEO(req, {
                title: 'Թեստեր - Ավտոդպրոց Արթիկ'
            }),
            nav_active: 'tests',
            page: req.url,
            test
        })
    },
    getGroups: async (req, res) => {
        res.render('client/pages/groups', {
            ...buildSEO(req, {
              title: 'Խմբեր - Ավտոդպրոց Արթիկ'
            }),
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
    getInfoDetails: async (req, res) => {
        res.render('client/pages/profile-info', {
            nav_active: 'info',
            page: req.url,
        })
    },
    getProfileHistory: async (req, res) => {
        res.render('client/pages/profile-history', {
            nav_active: 'history',
            page: req.url,
        })
    },
    getProfileOptions: async (req, res) => {
        res.render('client/pages/profile-options', {
            nav_active: 'options',
            page: req.url,
        })
    },
    getTestDetails: async (req, res) => {
        const test = await Test.findOne({
            include: 'questions',
            where: { id: req.params.id }
        });

        res.render('client/pages/test_details', {
            ...buildSEO(req, { title: `Թեստ - ${test?.title}` }),
            nav_active: 'test',
            page: req.url,
            test
        })
    },
    generateSitemap: async (req, res) => {
        console.log('edd')
       try {
            const links = [
                { url: '/', changefreq: 'weekly', priority: 1 },
                { url: '/tests', changefreq: 'weekly', priority: 0.9 },
                { url: '/groups', changefreq: 'monthly', priority: 0.7 },
            ];

            const stream = new SitemapStream({ hostname: `${req.protocol}://${req.get('host')}` });
            const xml = await streamToPromise(Readable.from(links).pipe(stream)).then(data => data.toString());

            res.header('Content-Type', 'application/xml');
            res.send(xml);
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    },
    getLogin: async (req, res) => {
        res.render('client/pages/login', {
            title: 'Մուտք',
            nav_active: 'login',
            page: req.url
        })
    }
}