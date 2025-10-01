// Modules
const { Router } = require('express');

// Controllers
const ctrls = require('../controllers');

const router = Router();


// Data access
router.use(ctrls.auth.isLoggedIn);
router.use(ctrls.auth.protect);
router.use(ctrls.auth.restrictTo('admin'));

// Admin routes
router.get('/', ctrls.admin_view.getAdmin);
router.get('/tests', ctrls.admin_view.getTests);
router.get('/test/:id', ctrls.admin_view.getTest);
router.get('/groups', ctrls.admin_view.getGroups);
router.get('/test/:id', ctrls.admin_view.getTest);
router.get('/group/:id', ctrls.admin_view.getGroup);
router.get('/question', ctrls.admin_view.getQuestion);
router.get('/students', ctrls.admin_view.getStudents);
router.get('/registration', ctrls.admin_view.getRegistration);
router.get('/reviews', ctrls.admin_view.getReviews);
router.get('/users', ctrls.admin_view.getUsers);

module.exports = router;