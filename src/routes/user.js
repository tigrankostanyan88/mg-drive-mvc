const router = require('express').Router();

const ctrls = require('../controllers');

if (typeof ctrls.auth?.isLoggedIn === 'function') {
    router.use(ctrls.auth.isLoggedIn);
} else {
    console.error('[Routes:user] isLoggedIn middleware is undefined');
}


router.post('/signUp', ctrls.auth.protectUser, ctrls.auth.signUp);
router.post('/signIn', ctrls.auth.protectUser, ctrls.auth.signIn);

router.get('/', ctrls.user.getUsers);
router.patch('/updateme', ctrls.auth.protect, ctrls.user.updateMe);
router.patch('/:id', ctrls.auth.protect, ctrls.user.updateUser);
router.post('/logout', ctrls.auth.protect, ctrls.auth.logOut);

module.exports = router;
