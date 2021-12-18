import express from 'express';
import sellerModel from '../models/seller.models.js'
import productModel from "../models/product.models.js";
import moment from "moment";
import multer from'multer'
import {mkdirSync} from 'fs';
import {existsSync} from 'fs';
import auth from "../middlewares/auth.mdw.js";


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
    console.log(ProductOfSeller)
    res.render('vWSeller/productsOfSeller',{
        ProductOfSeller,
        sellerUsername,
        empty: ProductOfSeller.length === 0,
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
    const stt = numPro[0].total + 1

    if (numPro[0].total + 1 < 10){

        newProID = 'P00'+ stt
    }
    else if (numPro[0].total + 1 < 100){
        newProID = 'P0'+ stt
    }
    else if (numPro[0].total + 1 < 1000) {
        newProID = 'P' + stt
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
        console.log(req.body)
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
            res.redirect(`/seller/addProduct`)
        }
    })
})


export default router;