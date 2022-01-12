import express from 'express';
import auth from '../middlewares/auth.mdw.js'
import BidderModels from "../models/bidder.models.js";
import ProductModels from "../models/product.models.js";
import AccountModels from "../models/account.models.js";
import productModel from "../models/product.models.js";

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

router.get('/comment/:id', auth, async function (req, res){
    const ProID = req.params.id;
    const product = await ProductModels.findById(ProID);
    const reviewList = await BidderModels.getReviewWithUserID(product.UploadUser, ProID);
    const review = await productModel.getReviewBidderSide(product.Winner, product.UploadUser, product.ProID)
    res.render('vwBidder/comment', {
        ProID,
        reviewList,
        hasReview: review == null,
        BidderReview: review,
        ProName: product.ProName
    });
});

router.post('/comment/:id', auth,async function (req, res){
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

router.get('/review', auth, async function (req, res){
    const UserID = res.locals.authUser.UserID;
    const reviewList = await BidderModels.getReviewWithUserID(UserID);
    const userInfo = await AccountModels.getUserInfo(UserID);
    for (let i = 0; i < reviewList.length; i++){
        const product = await ProductModels.findById(reviewList[i].ProID);
        reviewList[i].ProName = product.ProName;
    }
    userInfo.Percentage = userInfo.LikePoint * 100 / (userInfo.LikePoint + userInfo.DislikePoint);
    if (userInfo.Percentage >= 80)
        userInfo.Show = 1;
    else
        userInfo.Show = 0;
    res.render('vwBidder/review', {
        reviewList,
        userInfo
    });
});

export default router;