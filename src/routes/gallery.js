const router = require('express').Router();
const ctrls = require('../controllers');

router
    .route('/')
    .get(ctrls.gallery.getGalleries)
    .post(ctrls.gallery.addGallery);

router
    .route('/:id')
    .patch(ctrls.gallery.updateGallery)
    .delete(ctrls.gallery.deleteGallery);

module.exports = router;
