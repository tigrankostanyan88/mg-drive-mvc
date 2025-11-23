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
router.get('/', ctrls.admin_view.getDashboard);
router.get('/tests', ctrls.admin_view.getTests);
router.get('/groups', ctrls.admin_view.getGroups);
router.get('/questions', ctrls.admin_view.getQuestions);
router.get('/gallery', ctrls.admin_view.getGallery);
router.get('/users', ctrls.admin_view.getUsers);
router.get('/analytics', ctrls.admin_view.getAnalytics);
router.get('/faqs', ctrls.admin_view.getFaqs);
router.get('/contacts', ctrls.admin_view.getContacts);

module.exports = router;