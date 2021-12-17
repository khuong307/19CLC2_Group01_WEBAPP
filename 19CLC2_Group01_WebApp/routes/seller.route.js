import express from 'express';
import sellerModel from '../models/seller.models.js'
import productModel from "../models/product.models.js";

const router = express.Router();
//register.
router.get('/ProductsOf/:sellerUsername', async function(req, res){
    req.session.retURL = req.originalUrl
    const isLogin = req.session.auth || false
    const sellerUsername = req.params.sellerUsername || 0

    const limit = 6
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const tmp = await sellerModel.getProductsBySellerUsername(sellerUsername);
    if(tmp === null){
        return res.render('vWSeller/productsOfSeller',{
            empty: 1,
            sellerUsername
        })
    }
    const total = tmp.length
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

    const uploadUserID = await sellerModel.getUserIDByUsername(sellerUsername)
    const ProductOfSeller = await productModel.findPageByUploadUser(uploadUserID.UserID, limit, offset)

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
        empty: ProductOfSeller.length === 0,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        isLogin
    })
})

export default router;