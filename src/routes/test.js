const router = require('express').Router();

// Controllers
const ctrls = require('../controllers')

router
    .route('/')
    .post(ctrls.test.addTest)
    .get(ctrls.test.getTests)
    router
.route('/:id')
    .get(ctrls.test.getTest)
    .patch(ctrls.test.updateTest)
    .delete(ctrls.test.deleteTest)

module.exports = router;