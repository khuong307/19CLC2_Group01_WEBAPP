import express from 'express';
import sellerModel from '../models/seller.models.js'
import productModel from "../models/product.models.js";
import moment from "moment";
import multer from'multer'
import {mkdirSync} from 'fs';
import {existsSync} from 'fs';
import auth from "../middlewares/auth.mdw.js";
import BidderModels from "../models/bidder.models.js";
import AccountModels from "../models/account.models.js";
import ProductModels from "../models/product.models.js";
const router = express.Router();
//register.
router.get('/ProductsOf/:sellerUsername', async function(req, res){
    req.session.retURL = req.originalUrl
    const isLogin = req.session.auth || false
    const sellerUsername = req.params.sellerUsername || 0

    const limit = 6
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const tmp = await sellerModel.getProductsBySellerUsername(sellerUsername, limit, offset);

    if(tmp === null){
        return res.render('vWSeller/productsOfSeller',{
            empty: 1,
            sellerUsername
        })
    }
    const uploadUser = await sellerModel.getUserIDByUsername(sellerUsername)
    const productCount = await sellerModel.countProductByUserID(uploadUser.UserID)
    const total = productCount.total
    let nPages = Math.floor(total/limit)
    let pageNumbers = []
    if(total % limit > 0){
        nPages++
    }

    for (let i = 1; i <= nPages; i++){
        pageNumbers.push({
            value: i,
            isCurrentPage: +page === i,
        })
    }

    const ProductOfSeller = await productModel.findPageByUploadUser(uploadUser.UserID, limit, offset)

    for(const c of ProductOfSeller) {
        const highestBidder = await productModel.getUsernameMaxPriceByProID(c.ProID)
        if (highestBidder === null) {
            c.highestBidder = 'None'
        } else {
            c.highestBidder = highestBidder.Username
        }
        //insert CatID1
        const catID1 = await productModel.getCatID1FromCatID2(c.CatID2)
        c.CatID1 = catID1.CatID1

        const numberofAuction = await productModel.getNumberofAuctionByProID(c.ProID)
        if(numberofAuction === null){
            c.numberAuction = 0
        }else{
            c.numberAuction = numberofAuction.NumberOfAuction
        }

        const now = new Date();
        const date1 = moment.utc(now).format('MM/DD/YYYY')
        const date2 = moment.utc(c.UploadDate).format('MM/DD/YYYY')
        const diffTime = Math.abs(new Date(date1)- new Date(date2));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3){
            c.isNew = true
        }
        else
            c.isNew = false

        if (res.locals.WatchListByUSerID != null){
            for (const d of res.locals.WatchListByUSerID) {
                if (c.ProID === d.ProID) {
                    c.isWatchList = 1;
                }
            }
        }
    }
    res.render('vWSeller/productsOfSeller',{
        ProductOfSeller,
        sellerUsername,
        empty: ProductOfSeller === null,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        isLogin
    })
})


////upload a product/seller
router.get('/addProduct', auth, async function(req,res){
    req.session.retURL = req.originalUrl
    const CateL1 = await sellerModel.getCateL1()
    const CateL2 = await sellerModel.getCateL2()
    var actor = 0;
    if(res.locals.authUser != null){
        actor = res.locals.authUser.Type
    }

    res.render('vwSeller/addProduct',{
        CateL1,
        CateL2,
        CateL2String: JSON.stringify(CateL2),
        CateL1String: JSON.stringify(CateL1),
        isSeller: actor === 2
    })
})


router.post('/addProduct', async function(req,res){
    const catname1 = req.query.CatName1
    const catname2 = req.query.CatName2

    //get CatID1
    const catid1 = await sellerModel.getCatID1ByCatName1(catname1)
    const catid2 = await sellerModel.getCatID2ByCatName2(catname2)
    var numPro = await sellerModel.countProID()
    var newProID = ""
    const stt = parseInt(numPro[0].ProID.slice(1,4)) + 1

    if (stt + 1 < 10){
        newProID = 'P00'+ stt
    }
    else if (stt + 1 < 100){
        newProID = 'P0'+ stt
    }
    else if (stt + 1 < 1000) {
        newProID = 'P' + stt
    }

    const folderCat1 = './public/imgs/sp/'+catid1.CatID1
    try {
        if (!existsSync(folderCat1)) {
            mkdirSync(folderCat1)
        }
    } catch (err) {
        console.error(err)
    }

    const folderCat2 = './public/imgs/sp/'+catid1.CatID1+'/'+catid2.CatID2
    try {
        if (!existsSync(folderCat2)) {
            mkdirSync(folderCat2)
        }
    } catch (err) {
        console.error(err)
    }

    const folderName = './public/imgs/sp/'+catid1.CatID1+'/'+catid2.CatID2+'/'+newProID
    try {
        if (!existsSync(folderName)) {
            mkdirSync(folderName)
        }
    } catch (err) {
        console.error(err)
    }
    var i = 0;
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, folderName)
        },
        filename: function (req, file, cb) {
            const index = i++
            if(index === 0){
                cb(null, file.fieldname +'.jpg')
            }else {
                cb(null, file.fieldname + '_'+index + '.jpg')
            }
        }
    })

    const upload = multer({storage})
    const username = res.locals.authUser.Username
    upload.array('main', 3)(req, res, function (err){
        if(err){
            console.error(err)
        }else{
            const CateName1 = req.body.CateL1;
            const CateName2 = req.body.CateL2;
            const ProName = req.body.ProName;
            const CurrentPrice = req.body.CurrentPrice;
            const StepPrice = req.body.StepPrice;
            const EndDate = req.body.EndDate;
            const TinyDes = req.body.TinyDes;
            const FullDes = req.body.FullDes;

            const newEntity = {
                ProID: newProID,
                CatName1: catname1,
                CatName2: catname2,
                ProName,
                TinyDes,
                FullDes,
                UploadDate: new Date(),
                EndDate,
                CurrentPrice
            }
            sellerModel.InsertProInfo(newEntity)
            const newProduct = {
                ProID: newProID,
                CatID2: catid2.CatID2,
                UploadUser: res.locals.authUser.UserID,
                ProName,
                UploadDate: new Date(),
                EndDate,
                CurrentPrice,
                StepPrice,
                Status: 0,
                AutoExtendTime: req.body.Extend === 'on',
                PriceBuyNow: req.body.PriceBuyNow || 0,
                TinyDes,
                FullDes
            }
            sellerModel.InsertProduct(newProduct)
            res.redirect(`/seller/productsOf/${username}`)
        }
    })
})

//product out Date.
router.get('/productsOutDate/:sellerUsername', auth,async function(req, res){
    req.session.retURL = req.originalUrl
    const isLogin = req.session.auth || false
    const sellerUsername = req.params.sellerUsername || 0

    const limit = 6
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const tmp = await sellerModel.getOutDateProductsBySellerUsername(sellerUsername, limit, offset);
    const uploadUser = await sellerModel.getUserIDByUsername(sellerUsername)
    const productCount = await sellerModel.countOutdateProductByUserID(uploadUser.UserID)


    var isOwner = 0
    if(res.locals.authUser != null){
        if(sellerUsername === res.locals.authUser.Username){
            isOwner = 1
        }
        else{
            res.redirect('/')
        }
    }

    const total = productCount.total
    let nPages = Math.floor(total/limit)
    let pageNumbers = []
    if(total % limit > 0){
        nPages++
    }

    for (let i = 1; i <= nPages; i++){
        pageNumbers.push({
            value: i,
            isCurrentPage: +page === i,
        })
    }

    const ProductOfSeller = await productModel.findOutDatePageByUploadUser(uploadUser.UserID, limit, offset)

    for(const c of ProductOfSeller) {
        const highestBidder = await productModel.getUsernameMaxPriceByProID(c.ProID)
        if (highestBidder === null) {
            c.highestBidder = 'None'
        } else {
            c.highestBidder = highestBidder.Username
        }
        //insert CatID1
        const catID1 = await productModel.getCatID1FromCatID2(c.CatID2)
        c.CatID1 = catID1.CatID1

        const numberofAuction = await productModel.getNumberofAuctionByProID(c.ProID)
        if(numberofAuction === null){
            c.numberAuction = 0
        }else{
            c.numberAuction = numberofAuction.NumberOfAuction
        }

        const now = new Date();
        const date1 = moment.utc(now).format('MM/DD/YYYY')
        const date2 = moment.utc(c.UploadDate).format('MM/DD/YYYY')
        const diffTime = Math.abs(new Date(date1)- new Date(date2));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3){
            c.isNew = true
        }
        else
            c.isNew = false

        if (res.locals.WatchListByUSerID != null){
            for (const d of res.locals.WatchListByUSerID) {
                if (c.ProID === d.ProID) {
                    c.isWatchList = 1;
                }
            }
        }
    }

    res.render('vWSeller/productsOutDate',{
        ProductOfSeller,
        sellerUsername,
        empty: tmp === null,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        isLogin,
        isOwner
    })
})

//sold product.
//product out Date.
router.get('/productsSold/:sellerUsername', auth,async function(req, res){
    req.session.retURL = req.originalUrl
    const isLogin = req.session.auth || false
    const sellerUsername = req.params.sellerUsername || 0

    const limit = 3
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const tmp = await sellerModel.getSoldProductsBySellerUsername(sellerUsername, limit, offset);
    const uploadUser = await sellerModel.getUserIDByUsername(sellerUsername)
    const productCount = await sellerModel.countSoldProductByUserID(uploadUser.UserID)


    var isOwner = 0
    if(res.locals.authUser != null){
        if(uploadUser.UserID === res.locals.authUser.UserID){
            isOwner = 1
        }
        else{
            res.redirect('/')
        }
    }

    const total = productCount.total
    let nPages = Math.floor(total/limit)
    let pageNumbers = []
    if(total % limit > 0){
        nPages++
    }

    for (let i = 1; i <= nPages; i++){
        pageNumbers.push({
            value: i,
            isCurrentPage: +page === i,
        })
    }

    const ProductOfSeller = await productModel.findSoldPageByUploadUser(uploadUser.UserID, limit, offset)

    for(const c of ProductOfSeller) {
        const highestBidder = await productModel.getUsernameByUserID(c.Winner)
        if (highestBidder === null) {
            c.highestBidder = 'None'
        } else {
            c.highestBidder = highestBidder.Username
        }
        //insert CatID1
        const catID1 = await productModel.getCatID1FromCatID2(c.CatID2)
        c.CatID1 = catID1.CatID1

        const review = await productModel.getReviewSellerSide(c.UploadUser, c.Winner, c.ProID)
        if (review === null){
            c.hasReview = 0;
        }
        else{
            c.hasReview = 1;
            c.reviewContent = review;
        }

        const bidderRevew = await productModel.getReviewBidderSide(c.Winner, c.UploadUser, c.ProID)
        if (bidderRevew === null){
            c.hasBidderReview = 0;
        }
        else{
            c.hasBidderReview = 1;
            c.BidderReviewContent = bidderRevew;
        }

    }


    res.render('vWSeller/productsSold',{
        ProductOfSeller,
        sellerUsername,
        empty: tmp === null,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        isLogin,
        isOwner
    })
})

//review seller -> bidder
router.post('/reviewBidder', async function(req, res){
    const sellerID = req.query.seller;
    const bidderID = req.query.bidder;
    const proID = req.query.proid;
    const comment = req.body.Comment
    const now = new Date()
    const newReview = {
        SenderID: sellerID,
        ReceiverID: bidderID,
        ProID: proID,
        Comment: comment,
        Time: now
    }
    const tmp = await sellerModel.checkReview(sellerID, bidderID, proID)
    if(tmp === null){
        sellerModel.addNewReviewBySeller(newReview)
    }else{
        sellerModel.updateReview(newReview)
    }
    const url = req.headers.referer || '/'
    res.redirect(url)

})
//seller like dislike bidder.
//like
router.post('/sellerLike', async function(req, res){
    const sellerID = req.query.seller;
    const bidderID = req.query.bidder;
    const proID = req.query.proid;
    const now = new Date()
    const newReview = {
        SenderID: sellerID,
        ReceiverID: bidderID,
        ProID: proID,
        Status: 1
    }
    const tmp = await sellerModel.checkReview(sellerID, bidderID, proID)
    if(tmp === null){
        sellerModel.addNewReviewBySeller(newReview)
    }else{
        sellerModel.updateReview(newReview)
    }
    sellerModel.updateLikePoint(bidderID)
    const url = req.headers.referer || '/'
    res.redirect(url)

})
//dislike
router.post('/sellerDisLike', async function(req, res){
    const sellerID = req.query.seller;
    const bidderID = req.query.bidder;
    const proID = req.query.proid;
    const now = new Date()
    const newReview = {
        SenderID: sellerID,
        ReceiverID: bidderID,
        ProID: proID,
        Status: 0
    }
    const tmp = await sellerModel.checkReview(sellerID, bidderID, proID)
    if(tmp === null){
        sellerModel.addNewReviewBySeller(newReview)
    }else{
        sellerModel.updateReview(newReview)
    }
    sellerModel.updateDisLikePoint(bidderID)
    const url = req.headers.referer || '/'
    res.redirect(url)

})

router.post('/AutoCancel', auth,async function(req, res){
    const sellerID = req.query.seller;
    const bidderID = req.query.bidder;
    const proID = req.query.proid;
    const now = new Date()
    const newReview = {
        SenderID: sellerID,
        ReceiverID: bidderID,
        ProID: proID,
        Status: 0,
        Time: new Date(),
        Comment: 'Người thắng không thanh toán'
    }

    sellerModel.addNewReviewBySeller(newReview)
    sellerModel.updateDisLikePoint(bidderID)
    sellerModel.updateStatusProductByProID(proID)
    const url = req.headers.referer || '/'
    res.redirect(url)
})

router.get('/review/:id', auth, async function (req, res){
    const UserID = req.params.id
    const username = await productModel.getUsernameByUserID(UserID)
    const reviewList = await BidderModels.getReviewWithUserID(UserID);
    const userInfo = await AccountModels.getUserInfo(UserID);
    if (reviewList != null){
        for (let i = 0; i < reviewList.length; i++){
            const product = await productModel.findById(reviewList[i].ProID);
            reviewList[i].ProName = product.ProName;
        }
    }
    userInfo.Percentage = userInfo.LikePoint * 100 / (userInfo.LikePoint + userInfo.DislikePoint);
    if (userInfo.Percentage >= 80)
        userInfo.Show = 1;
    else
        userInfo.Show = 0;
    res.render('vwSeller/review', {
        reviewList,
        userInfo,
        username: username.Username
    });
});

export default router;