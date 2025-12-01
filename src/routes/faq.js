const router = require('express').Router();
const ctrls = require('../controllers');

router.get('/', ctrls.faq.getFaqs);
router.post('/', ctrls.faq.addFaq);
router.put('/:id', ctrls.faq.updateFaq);
router.delete('/:id', ctrls.faq.deleteFaq);

module.exports = router;

