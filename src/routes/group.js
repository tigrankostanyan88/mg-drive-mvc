const router = require('express').Router();

// Controllers
const ctrls = require('../controllers')

router.route('/')
    .post(ctrls.group.addGroup)
    .get(ctrls.group.getGroups)
router.route('/:id')
    .get(ctrls.group.getGroup)
    .patch(ctrls.group.updateGroup)
    .delete(ctrls.group.deleteGroup)

module.exports = router;