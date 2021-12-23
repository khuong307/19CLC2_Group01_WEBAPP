// MINH
import express from 'express';
import userModel from '../../models/user.models.js';
import accountModel from "../../models/account.models.js";

const router = express.Router();

router.get('/', async function(req, res){
    req.session.retURL=req.originalUrl;
    res.render('admin/vwUser/menuUser');
})

router.get('/seller',async function(req,res){
    req.session.retURL=req.originalUrl;
    const sellerList=await userModel.findALlSeller();
    res.render('admin/vwUser/sellerList',{sellerList});
})

router.get('/bidder',async function(req,res){
    req.session.retURL=req.originalUrl;
    const UserID=res.locals.authUser.UserID;
    const bidderList=await userModel.findAllBidderExceptAdmin(UserID);
    res.render('admin/vwUser/bidderList',{bidderList});
})

router.get('/upgrade',async function(req,res){
    req.session.retURL=req.originalUrl;
    res.render('admin/vwUser/upgradeList');
})


router.get('/seller/edit',async function(req,res){
    req.session.retURL=req.originalUrl;
    const userID=req.query.id;
    const UserInfo = await accountModel.getUserInfo(userID)
    console.log(UserInfo)
    res.render('admin/vwUser/editSeller',{
        UserInfo
    })
})


router.get('/bidder/edit',async function(req,res){
    const userID=req.query.id;
    const UserInfo = await accountModel.getUserInfo(userID)
    console.log(UserInfo)
    res.render('admin/vwUser/editBidder',{
        UserInfo
    })
})

export default router;