//admin/categories
import express from 'express';
import productModel from '../models/product.models.js'
import auth from '../middlewares/auth.mdw.js'
import ProductModels from "../models/product.models.js";
import AccountModels from "../models/account.models.js";
import BidderModels from "../models/bidder.models.js";
import FuncMdw from "../middlewares/func.mdw.js";
const router = express.Router();
//Khuong.
router.get('/byCat/:id', async function(req, res){
    const catID2 = req.params.id || 0
    req.session.retURL = req.originalUrl

    for (const c of res.locals.lcCategories){ // nhấn vào thì hiện xanh.
        if(c.CatID2 === catID2){
            c.isActive = 1;
            break
        }
    }

    for (const c of res.locals.lcCategories){ // nhấn vào thì hiện xanh.
        if(c.isActive === 1){
            for (const d of res.locals.CategoryL1){
                if (d.CatID1 === c.CatID1){
                    d.isActive = 1;
                    break;
                }
            }
        }
    }

    const limit = 3
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const total = await productModel.countByCatID(catID2)
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

    const list = await productModel.findPageByCatID(catID2, limit, offset)

    //check wwhich product selected in watch list
    if (res.locals.WatchListByUSerID != undefined){
        for(const c of list){
            for (const d of res.locals.WatchListByUSerID){
                if (c.ProID === d.ProID){
                    c.isWatchList = 1;
                }
            }
        }
    }
    const isLogin = req.session.auth || false
    console.log(isLogin)

    res.render('vwProducts/byCat', {
        products: list,
        empty: list.length === 0,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        isLogin
    })
})

router.get('/detail/:id', async function(req, res){
    //const catID = req.query.id || 0
    req.session.retURL = req.originalUrl
    const proID = req.params.id || 0
    var CatID = await productModel.findCatIDByProID(proID)
    for (const c of res.locals.lcCategories){ // nhấn vào thì hiện xanh.
        if(c.CatID2 === CatID){
            c.isActive = 1;
            break
        }
    }

    for (const c of res.locals.lcCategories){ // nhấn vào thì hiện xanh.
        if(c.isActive === 1){
            for (const d of res.locals.CategoryL1){
                if (d.CatID1 === c.CatID1){
                    d.isActive = 1;
                    break;
                }
            }
        }
    }


    const product = await productModel.findById(proID)
    const catID2 = await productModel.getCatID2FromProID(proID)
    const catID1 = await productModel.getCatID1FromCatID2(catID2.CatID2)
    const list5Relate = await productModel.getRelateProduct(catID2.CatID2, proID)

    for (const c of list5Relate){
        c.CatID1 =  catID1.CatID1
    }


    if(product===null){
        return res.redirect('/')
    }

    // Khang
    const WatchList = res.locals.WatchListByUSerID;
    if (WatchList != undefined){
        for (var i = 0; i < WatchList.length; i++){
            if (WatchList[i].ProID === product.ProID){
                product.isActive = true;
            }
        }
        if (product.isActive === undefined)
            product.isActive = null;
    }

    if (res.locals.authUser != false){
        const userID = res.locals.authUser.UserID;
        var userInfo = await AccountModels.getUserInfo(userID);
        var flag = true;
        const auctionList = await ProductModels.getAuctionByProIDAndUserID(userID, proID);
        const fullAuctionList = await ProductModels.getAuctionByProID(proID);
        for (let i = 0; i < fullAuctionList.length; i++){
            if (fullAuctionList[i].isBuyNow === 1){
                flag = false;
                break;
            }
        }
        if (!flag){
            userInfo.NotShow = 1;
            userInfo.Message = 1;
        }
        else{
            for (let i = 0; i < auctionList.length; i++){
                if (auctionList[i].Status === 0){
                    flag = false;
                    break;
                }
            }
            if (!flag){
                userInfo.NotShow = 1;
                userInfo.Message = 0;
            }
            else{
                const totalReview = userInfo.LikePoint + userInfo.DislikePoint;
                if (totalReview === 0 || userInfo.LikePoint / totalReview < 0.8){
                    const permissionList = await BidderModels.getPermissionByUserIDAndProID(userID, proID);
                    if (permissionList.length === 0){
                        userInfo.Auction = 0;
                        userInfo.Show = 1;
                    }
                    else{
                        if (permissionList[permissionList.length-1].Status === 0){
                            userInfo.Auction = 0;
                            userInfo.Show = 0;
                        }
                        else if (permissionList[permissionList.length-1].Status === 1){
                            userInfo.Auction = 1;
                        }
                        else{
                            userInfo.Auction = 0;
                            userInfo.Show = 1;
                        }
                    }
                }
                else{
                    userInfo.Auction = 1;
                }
                console.log(userInfo);
            }
        }
    }
    // Khang

    res.render('vwProducts/detail', {
        product,
        empty: product.length === 0,
        list5Relate,
        Category1: catID1.CatID1,
        userInfo
    })
})
//Khuong.

// Khang
router.get('/WatchList', auth, async function (req, res){
    req.session.retURL = req.originalUrl

    const limit = 3
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const userID = req.session.authUser.UserID
    const total = res.locals.lengthOfWatchList
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


    const WatchList = await productModel.getWatchListFromUserID(userID, limit, offset);

    for (const obj of WatchList){
        const CatID2 = obj.CatID2;
        const CatID1 = await productModel.getCatID1FromCatID2(CatID2);
        obj.CatID1 = CatID1.CatID1;
    }

    res.render('vwProducts/watchList', {
        products: WatchList,
        empty: WatchList.length === 0,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages
    })
})

router.post('/addWatchList', async function (req, res){
    req.session.retURL = req.originalUrl
    const id = req.body.ProID;
    console.log(id);

    const userid = req.session.authUser.UserID || ''
    const entity = {
        UserID: userid,
        ProID: id
    };
    const ret = await productModel.addToWatchList(entity);
    const url = req.headers.referer || '/'
    res.redirect(url)
});

router.post('/delWatchList', async function(req, res){
    req.session.retURL = req.originalUrl
    const id = req.body.ProID;
    const userid = req.session.authUser.UserID || ''
    const entity = {
        UserID: userid,
        ProID: id
    };
    const ret = await productModel.delFromWatchList(entity);
    const url = req.headers.referer || '/';
    if (url.includes("http://localhost:3000/products/WatchList")){
        console.log("true");
        const list = res.locals.WatchListByUSerID;
        const length = list.length - 1;
        for (var i = 0; i < list.length; i++){
            if (list[i].ProID === id)
                break;
        }
        if (length % 3 === 0 && i === length && length !== 0){
            if (length / 3 === 1)
                res.redirect("/products/WatchList");
            else
                res.redirect(`/products/WatchList?page=${length/3}`);
        }
        else
            res.redirect(url);
    }
    else
        res.redirect(url);
});

router.get('/history', async function (req, res){
    req.session.retURL = req.originalUrl
    const ProID = req.query.ProID;
    const type = req.query.show;
    const page = req.query.page || 1;
    var lst = [];
    if (type === undefined || type === "top-5"){
        var display = false;
        lst = await ProductModels.getAuctionByProIDWithLimit(ProID, 5, 0);
    }
    else{
        var display = true;
        const offset = (page-1)*6;
        const length = await ProductModels.getLengthAuction(ProID);
        if (length === 0)
            display = false;
        else{
            var nPages = Math.floor(length/6);
            var pageNumbers = [];

            if(length % 6 > 0){
                nPages++;
            }

            for (var i = 1; i <= nPages; i++){
                pageNumbers.push({
                    value: i,
                    isCurrentPage: +page === i,
                });
            }
            lst = await ProductModels.getAuctionByProIDWithLimit(ProID, 6, offset);
        }
    }
    for (var i = 0; i < lst.length; i++) {
        lst[i].No = (i + 1) + (page - 1) * 6;
    }
    res.render('vwProducts/history', {
        Users: lst,
        ProID,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        display
    });
});

router.post('/auction/:id', async function (req, res){
    const d = new Date();
    console.log(req.body.txtPrice);
    if (req.body.txtRequest !== undefined){
        const entity = {
            BidderID: res.locals.authUser.UserID,
            ProID: req.params.id,
            Time: d,
            Status: 0,
            AcceptTime: null
        };
        await BidderModels.insertToPermission(entity);
    }
    else{
        const entity = {
            UserID: res.locals.authUser.UserID,
            ProID: req.params.id,
            MaxPrice: req.body.txtPrice,
            Time: d
        };
        const product = await ProductModels.findById(entity.ProID);
        const priceList = await ProductModels.getMaxPriceByProID(entity.ProID);
        if (priceList.length === 0){
            await BidderModels.insertMaxPrice(entity);
            const new_entity = {
                UserID: res.locals.authUser.UserID,
                ProID: req.params.id,
                Time: d,
                Price: product.CurrentPrice,
                Status: 1,
                Header: res.locals.authUser.UserID,
            };
            if (req.body.txtBuyNow !== undefined) {
                new_entity.isBuyNow = 1;
                new_entity.Price = product.PriceBuyNow;
            }
            await ProductModels.insertAuction(new_entity);
            await ProductModels.updatePriceProduct(new_entity);
            if (req.body.txtBuyNow !== undefined)
                await ProductModels.updateWinnerProduct(new_entity);
            await FuncMdw.sendEmail(new_entity.UserID, `Bạn đã đấu giá thành công sản phẩm ${new_entity.ProID} với mức giá ${new_entity.Price}`);
            await FuncMdw.sendEmail(product.UploadUser, `Sản phẩm ${new_entity.ProID} hiện đang có mức giá ${new_entity.Price} giữ bởi người dùng ${new_entity.UserID}`);
        }
        else{
            const obj = await BidderModels.selectMaxPrice(entity);
            if (obj[0].Num !== 0)
                await BidderModels.updateMaxPrice(entity);
            else
                await BidderModels.insertMaxPrice(entity);
            if (product.CurrentPrice != entity.MaxPrice){
                const new_entity = {
                    ProID: req.params.id,
                    Time: d,
                    Status: 1,
                };
                if (priceList[0].MaxPrice >= entity.MaxPrice){
                    if (req.body.txtBuyNow !== undefined){
                        new_entity.Price = entity.MaxPrice;
                        new_entity.Header = res.locals.authUser.UserID;
                        new_entity.UserID = res.locals.authUser.UserID;
                        new_entity.isBuyNow = 1
                    }
                    else{
                        new_entity.Price = entity.MaxPrice;
                        new_entity.Header = priceList[0].UserID;
                        new_entity.UserID = priceList[0].UserID;
                    }
                }
                else{
                    if (req.body.txtBuyNow !== undefined){
                        new_entity.Price = entity.MaxPrice;
                        new_entity.Header = res.locals.authUser.UserID;
                        new_entity.UserID = res.locals.authUser.UserID;
                        new_entity.isBuyNow = 1
                    }
                    else{
                        new_entity.Price = priceList[0].MaxPrice + product.StepPrice;
                        new_entity.Header = res.locals.authUser.UserID;
                        new_entity.UserID = res.locals.authUser.UserID;
                    }
                }
                if ((priceList[0].UserID !== entity.UserID) || (priceList[0].UserID === entity.UserID && req.body.txtBuyNow !== undefined)){
                    await ProductModels.insertAuction(new_entity);
                    await ProductModels.updatePriceProduct(new_entity);
                    if (req.body.txtBuyNow !== undefined)
                        await ProductModels.updateWinnerProduct(new_entity);
                    await FuncMdw.sendEmail(new_entity.UserID, `Bạn đã đấu giá thành công sản phẩm ${new_entity.ProID} với mức giá ${new_entity.Price}`);
                    await FuncMdw.sendEmail(product.UploadUser, `Sản phẩm ${new_entity.ProID} hiện đang có mức giá ${new_entity.Price} giữ bởi người dùng ${new_entity.UserID}`);
                    if (new_entity.UserID !== priceList[0].UserID)
                        await FuncMdw.sendEmail(priceList[0].UserID, `Sản phẩm ${new_entity.ProID} hiện đang có mức giá ${new_entity.Price} giữ bởi người dùng ${new_entity.UserID}`);
                }
            }
            else{
                if (req.body.txtBuyNow !== undefined){
                    const new_entity = {
                        UserID: res.locals.authUser.UserID,
                        ProID: req.params.id,
                        Time: d,
                        Price: product.CurrentPrice,
                        Status: 1,
                        Header: res.locals.authUser.UserID,
                        isBuyNow: 1
                    };
                    await ProductModels.insertAuction(new_entity);
                    await ProductModels.updatePriceProduct(new_entity);
                    await ProductModels.updateWinnerProduct(new_entity);
                    await FuncMdw.sendEmail(new_entity.UserID, `Bạn đã đấu giá thành công sản phẩm ${new_entity.ProID} với mức giá ${new_entity.Price}`);
                    await FuncMdw.sendEmail(product.UploadUser, `Sản phẩm ${new_entity.ProID} hiện đang có mức giá ${new_entity.Price} giữ bởi người dùng ${new_entity.UserID}`);
                    if (new_entity.UserID !== priceList[0].UserID)
                        await FuncMdw.sendEmail(priceList[0].UserID, `Sản phẩm ${new_entity.ProID} hiện đang có mức giá ${new_entity.Price} giữ bởi người dùng ${new_entity.UserID}`);
                }
            }
        }
    }
    const url = req.headers.referer || '/';
    res.redirect(url);
})

router.get("/AuctionList", async function (req, res){
    req.session.retURL = req.originalUrl;
    const userID = res.locals.authUser.UserID;
    const d = new Date();

    const limit = 3
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const total = res.locals.lengthOfAuctionList;
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

    const current = d.toISOString().slice(0, 19).replace('T', ' ');
    const ProIDList = await productModel.getAuctioningListWithLimitOffset(userID, current, limit, offset);
    var list = [];
    console.log(ProIDList);
    for (let i = 0; i < ProIDList.length; i++){
        const product = await productModel.findById(ProIDList[i].ProID);
        list.push(product);
    }

    //check wwhich product selected in watch list
    if (res.locals.WatchListByUSerID != undefined){
        for(const c of list){
            for (const d of res.locals.WatchListByUSerID){
                if (c.ProID === d.ProID){
                    c.isWatchList = 1;
                }
            }
        }
    }
    const isLogin = req.session.auth || false
    console.log(isLogin)

    res.render('vwProducts/byCat', {
        products: list,
        empty: list.length === 0,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        isLogin
    })
});

router.get('/WinList', async function(req, res){
    res.render('vwProducts/winList');
})
// Khang
export default router;