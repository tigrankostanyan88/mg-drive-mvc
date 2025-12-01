const router = require('express').Router();

const ctrls = require('../controllers');

router
    .route('/')
    .post(ctrls.gallery.addGallery)
    .get(ctrls.gallery.getGalleries);

router
    .route('/:id')
    .patch(ctrls.gallery.updateGallery)
    .delete(ctrls.gallery.deleteGallery);

module.exports = router;
