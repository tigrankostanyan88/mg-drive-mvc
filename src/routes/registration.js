// Modules
const router = require('express').Router();

// Controllers
const ctrls = require('../controllers');

router
    .route('/')
    .post(ctrls.registration.createRegistration)
    .get(ctrls.registration.getRegistration);

router
    .route('/:id')
    .delete(ctrls.registration.deleteRegistration);

module.exports = router;
