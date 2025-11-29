// Modules
const router = require('express').Router();

// Controllers
const ctrls = require('../controllers');

router
    .route('/')
    .post(ctrls.registration.createRegistration)
    .get(ctrls.registration.getRegistration);


module.exports = router;
