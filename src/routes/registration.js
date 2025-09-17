// Modules
const router = require('express').Router();

// Controllers
const ctrls = require('../controllers');

router
    .route('/')
    .post(ctrls.registration.addRegistration)
    .get(ctrls.registration.getRegistration);


module.exports = router;
