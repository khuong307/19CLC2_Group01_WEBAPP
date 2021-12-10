import express from 'express';

const router = express.Router();
//register.
router.get('/register', async function(req, res){
    res.render('vWAccount/register')
})

//login.
router.get('/login', async function(req, res){
    res.render('vWAccount/login')
})

//login.
router.get('/profile', async function(req, res){
    res.render('vWAccount/profile')
})

export default router;