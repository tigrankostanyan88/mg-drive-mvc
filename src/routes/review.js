const router = require('express').Router();

const ctrls = require('../controllers');

// router.get('/', ctrls.review.addReview);

// router.use(ctrls.autreviewh.isLoggedIn)
// router.use(ctrls.review.protect)
// router.use(ctrls.auth.isLoggedIn);
// router.use(ctrls.auth.protect);

router.post('/', ctrls.review.addReview);

module.exports = router;