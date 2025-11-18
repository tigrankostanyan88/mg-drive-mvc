// Modules
const { Router } = require('express');

// Controllers
const ctrls = require('../controllers');
// Routes
const router = Router();
router.use(ctrls.auth.isLoggedIn)

router.get('/', ctrls.view.getHome);
router.get('/tests', ctrls.view.getTests);
router.get('/groups', ctrls.view.getGroups);

router.get('/sitemap.xml', ctrls.view.generateSitemap);
router.use(ctrls.auth.protect)

router.get('/profile', ctrls.view.getProfile);
router.get('/profile/options', ctrls.view.getProfileOptions);
router.get('/profile/history', ctrls.view.getProfileHistory);
router.get('/profile/info', ctrls.view.getInfoDetails);

// Data access
router.get(
    '/login',
    ctrls.auth.isLoggedIn,
    ctrls.auth.protectUser,
    ctrls.view.getLogin
);

module.exports = router;