const router = require('express').Router();

const ctrls = require('../controllers');

router
    .route('/')
    .post(ctrls.gallery.addGallery);

module.exports = router;
