const router = require('express').Router();

// Controllers
const ctrls = require('../controllers')

router.route('/')
    .post(ctrls.question.addQuestion)
router.route('/:id')
    .patch(ctrls.question.updateQuestion)
    .delete(ctrls.question.deleteQuestion)

module.exports = router;