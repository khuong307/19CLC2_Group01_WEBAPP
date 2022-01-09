import express from 'express';
import auth from '../middlewares/auth.mdw.js'
import BidderModels from "../models/bidder.models.js";
import ProductModels from "../models/product.models.js";
import AccountModels from "../models/account.models.js";

const router = express.Router();

router.get('/upgrade', auth, async function (req, res){
    req.session.retURL = req.originalUrl;
    console.log(res.locals.upgrade)
    if (res.locals.upgrade === "Can upgrade")
        res.render('vwBidder/upgrade', {
            view: true
        });
    else{
        res.render('vwBidder/upgrade', {
            view: false
        });
    }
});

router.post('/send-request', async function (req, res){
    const status = req.body.isAccept;
    const userid = req.session.authUser.UserID;
    const now = new Date();
    const entity = {
        UserID: userid,
        Time: now,
        Change: 1,
        Status: 0,
        AcceptTime: null
    };
    if (status === undefined){
        const ncheck = true;
        res.render('vwBidder/upgrade', {
            view: true,
            ncheck
        })
    }
    else{
        const ret = await BidderModels.sendToAdmin(entity);
        console.log(ret)
        res.redirect('/')
    }
});

router.get('/comment/:id', async function (req, res){
    const ProID = req.params.id;
    const product = await ProductModels.findById(ProID);
    const reviewList = await BidderModels.getReviewWithUserID(product.UploadUser, ProID);
    console.log(reviewList);
    res.render('vwBidder/comment', {
        ProID,
        reviewList
    });
});

router.post('/comment/:id', async function (req, res){
    const comment = req.body.txtComment;
    const like = req.body.txtLike;
    const ProID = req.params.id;
    const product = await ProductModels.findById(ProID);
    const now = new Date();
    const entity = {
        SenderID: res.locals.authUser.UserID,
        ReceiverID: product.UploadUser,
        ProID,
        Time: now,
        Comment: comment,
        Status: like
    }
    await BidderModels.insertReview(entity);
    await BidderModels.updatePoint(entity);
    res.redirect("/");
});

router.get('/review', async function (req, res){
    const UserID = res.locals.authUser.UserID;
    const reviewList = await BidderModels.getReviewWithUserID(UserID);
    const userInfo = await AccountModels.getUserInfo(UserID);
    for (let i = 0; i < reviewList.length; i++){
        const product = await ProductModels.findById(reviewList[i].ProID);
        reviewList[i].ProName = product.ProName;
    }
    res.render('vwBidder/review', {
        reviewList,
        userInfo
    });
});

export default router;