// Modules
const router = require('express').Router();

// Controllers
const ctrls = require('../controllers');

router
    .route('/')
    .get(ctrls.contact.getContacts)
    .patch(
        // ctrls.auth.isLoggedIn, 
        // ctrls.auth.protect, 
        ctrls.contact.updateContacts
    )

module.exports = router;