const { Router } = require('express');
const ctrls = require('../controllers');

const router = Router();

router
    .route('/:id')
    .delete(ctrls.image.deleteImage)

module.exports = router;