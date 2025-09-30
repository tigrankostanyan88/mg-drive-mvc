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


router.get('/profile', ctrls.view.getProfile);
router.get('/profile/options', ctrls.view.getProfileOptions);
router.get('/profile/history', ctrls.view.getProfileHistory);

// router.get('/test/:id', ctrls.view.getTestDetails);
// router.get('/group/:id', ctrls.view.getGroup);
// router.get('/groups/', ctrls.view.getGroups);

// Data access
router.get(
    '/login',
    ctrls.auth.isLoggedIn,
    ctrls.auth.protectUser,
    ctrls.view.getLogin
);

module.exports = router;