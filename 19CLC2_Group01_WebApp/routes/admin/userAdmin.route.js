//admin/user
// MINH
import express from 'express';
import userModel from '../../models/user.models.js';

const router = express.Router();

router.get('/', async function(req, res){
    res.render('admin/vwUser/menuUser');
})

router.get('/seller',async function(req,res){
    const sellerList=await userModel.findALlSeller();
    res.render('admin/vwUser/sellerList',{sellerList});
})

router.get('/bidder',async function(req,res){
    const UserID=res.locals.authUser.UserID;
    const bidderList=await userModel.findAllBidderExceptAdmin(UserID);
    res.render('admin/vwUser/bidderList',{bidderList});
})

router.get('/upgrade',async function(req,res){
    res.render('admin/vwUser/upgradeList');
})

router.get('/seller/add',async function(req,res){
    res.render('admin/vwUser/addSeller');
})

router.get('/seller/edit',async function(req,res){
    // const UserID=req.query.id || 0;
    // const seller=await userModel.findDetailWithID(UserID);

    res.render('admin/vwUser/editSeller');
})

export default router;