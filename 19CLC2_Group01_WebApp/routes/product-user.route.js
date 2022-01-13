//admin/categories
import express from 'express';
import productModel from '../models/product.models.js'
import accountModels from "../models/account.models.js";
import auth from '../middlewares/auth.mdw.js'
import moment from 'moment';
import mails from "nodemailer";
import bidderModels from "../models/bidder.models.js";
import sellerModels from "../models/seller.models.js"; //format date.
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
    for (let i = 0; i < list.length; i++){
        const auction = await productModel.getAuctionByProID(list[i].ProID);
        if (auction != null && res.locals.authUser != null){
            if (auction.length !== 0 && res.locals.authUser.UserID === auction[0].UserID)
                list[i].Show = 1;
        }
    }
    //check which product selected in watch list
    if (res.locals.WatchListByUSerID != null){
        for(const c of list){
            for (const d of res.locals.WatchListByUSerID){
                if (c.ProID === d.ProID){
                    c.isWatchList = 1;
                }
            }
        }
    }

    //get highest bidder + number of auction
    for(const c of list){
        const highestBidder =  await productModel.getUsernameMaxPriceByProID(c.ProID)
        if (highestBidder === null){
            c.highestBidder = 'None'
        }else{
            c.highestBidder = highestBidder.Username
        }

        const numberofAuction = await productModel.getNumberofAuctionByProID(c.ProID)
        if(numberofAuction === null){
            c.numberAuction = 0
        }else{
            c.numberAuction = numberofAuction.NumberOfAuction
        }

        //check í new product. (3 days)
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
    }

    const isLogin = req.session.auth || false
    if (res.locals.WinningListByUserID != null){
        for(const c of list){
            for (const d of res.locals.WinningListByUserID){
                if (c.ProID === d.ProID){
                    c.isWinning = 1;
                }
            }
        }
    }

    res.render('vwProducts/byCat', {
        products: list,
        empty: list.length === 0,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        isLogin,
        CatID2: catID2
    })
})

// search by price ascending
router.get('/byCat',
    async function (req, res) {
        req.session.retURL = req.originalUrl
        const CatID2 = req.query.id
        const type = req.query.type

        //type = 1: price ascending, type =2, valid date descending.
        const proIDs = await productModel.getProductsByCatID2(CatID2)

        if (proIDs === null) {
            return res.render('vwProducts/byCat', {
                empty: true,
            })
        } else {
            const limit = 3
            const page = req.query.page || 1 //Paging
            const offset = (page - 1) * limit

            const total = proIDs.length
            let nPages = Math.floor(total / limit)
            let pageNumbers = []
            if (total % limit > 0) {
                nPages++
            }

            for (let i = 1; i <= nPages; i++) {
                pageNumbers.push({
                    value: i,
                    isCurrentPage: +page === i,
                })
            }
            var list = []
            if (type === '1') {
                list = await productModel.getProductsByCatID2ByPrice(CatID2, limit, offset)
            } else if (type === '2')
                list = await productModel.getProductsByCatID2ByDate(CatID2, limit, offset)
            const resultList = [];

            for (const c of list) {
                const d = await productModel.getProductByProID(c.ProID);
                resultList.push(d);
            }
            console.log(resultList)
            for (const d of resultList) {
                const CatID2 = d.CatID2;
                const CatID1 = await productModel.getCatID1FromCatID2(CatID2);
                d.CatID1 = CatID1.CatID1;

                const highestBidder = await productModel.getUsernameMaxPriceByProID(d.ProID)
                if (highestBidder === null) {
                    d.highestBidder = 'None'
                } else {
                    d.highestBidder = highestBidder.Username
                }

                const numberofAuction = await productModel.getNumberofAuctionByProID(d.ProID)
                if (numberofAuction === null) {
                    d.numberAuction = 0
                } else {
                    d.numberAuction = numberofAuction.NumberOfAuction
                }

                //check í new product. (3 days)
                const now = new Date();
                const date1 = moment.utc(now).format('MM/DD/YYYY')
                const date2 = moment.utc(d.UploadDate).format('MM/DD/YYYY')
                const diffTime = Math.abs(new Date(date1) - new Date(date2));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 3) {
                    d.isNew = true
                } else
                    d.isNew = false

            }

            if (res.locals.WatchListByUSerID != null) {
                for (const d of resultList) {
                    for (const c of res.locals.WatchListByUSerID) {
                        if (d.ProID === c.ProID) {
                            d.isWatchList = 1;
                        }
                    }
                }
            }
            const isLogin = req.session.auth || false
            var isLowtoHighPrice = 0;
            var isDateClose = 0;
            if (type === '1')
                isLowtoHighPrice = 1
            else if (type === '2')
                isDateClose = 1

            res.render('vwProducts/byCat', {
                empty: 0,
                isLowtoHighPrice,
                isDateClose,
                products: resultList,
                type,
                isLogin,
                pageNumbers,
                currentPageIndex: page,
                isFirstPage: +page != 1,
                isLastPage: +page != nPages,
                CatID2,
            })
        }
    });

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
    if (WatchList != null){
        for (var i = 0; i < WatchList.length; i++){
            if (WatchList[i].ProID === product.ProID){
                product.isActive = true;
            }
        }
        if (product.isActive === undefined)
            product.isActive = null;
    }
    // Khang

    //check upload user.
    const sellerUsername = await productModel.getSellerNamebyUploadUserID(product.UploadUser);
    product.sellerUsername = sellerUsername.Username

    var highestBidder = "0"
    const UploadUserPoint = await accountModels.getPointByUserID(product.UploadUser)
    const Bidder =  await productModel.getUsernameMaxPriceByProID(product.ProID)
    var bidderID = ""
    if (Bidder === null){
        highestBidder = 'None'
    }else{
        highestBidder = Bidder.Username
        bidderID = Bidder.UserID
    }


    const desHistory = await productModel.getDescriptionHistoryByProID(proID);

    //check user is owner;
    var isOwner = 0
    if(res.locals.authUser != null){
        if(product.UploadUser === res.locals.authUser.UserID){
            isOwner = 1
        }
    }

    //get bidder information.
    const bidderInfo = await productModel.getBidderInfoByProID(proID)
    if (bidderInfo != null){
        for(const c of bidderInfo){
            const tmp = await productModel.getUsernameByUserID(c.Header)
            c.HeaderUsername = tmp.Username
        }
    }

    if (res.locals.authUser != null){
        const userID = res.locals.authUser.UserID;
        var userInfo = await accountModels.getUserInfo(userID);
        var flag = true;
        const auctionList = await productModel.getAuctionByProIDAndUserID(userID, proID);
        const fullAuctionList = await productModel.getAuctionByProID(proID);
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
                    const permissionList = await bidderModels.getPermissionByUserIDAndProID(userID, proID);
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
            }
        }
    }

    //get all request.
    const allRequest = await sellerModels.getBidderFirstRequest(proID);
    for(const c of allRequest){
        c.Username = await sellerModels.getUsernameByUserID(c.BidderID)
    }

    var isWinner = 0 //để xem được detail sau khi sản phẩm có ng mua thì phải là ng bán và winner
    if (res.locals.authUser != null){
        if (res.locals.authUser.UserID == product.Winner){
            isWinner = 1
        }
    }

    //nếu sản phẩm đã có người mua thì chỉ có ng bán và người mua xem được
    if (product.Winner !== null){
        if (isWinner == 0 && isOwner == 0){
            res.redirect('/')
        }
    }

    //sản phẩm hết hạn + không có người mua chỉ có người bán mới xem được.
    if (product.EndDate < new Date() && product.Winner == null){
        if (isOwner == 0){
            res.redirect('/')
        }
    }

    res.render('vwProducts/detail', {
        product,
        empty: product.length === 0,
        list5Relate,
        Category1: catID1.CatID1,
        UploadUserPoint,
        highestBidder,
        desHistory,
        isOwner,
        bidderInfo,
        proID,
        hasWinner: product.Winner === null,
        userInfo,
        allRequest,
        bidderID,
        hasBidder: highestBidder != 'None',
    })
})
//Khuong.

// Khang
router.get('/WatchList', auth, async function (req, res){

    req.session.retURL = req.originalUrl
    for (const d of res.locals.CategoryL1){ // count tổng số lượng sản phẩm trong 1 CategoryL1.
        d.numberPro = 0;
        for (const c of res.locals.lcCategories){
            if (d.CatID1 === c.CatID1){
                d.numberPro += c.ProductCount;
            }
        }
    }

    const limit = 3
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const userID = req.session.authUser.UserID
    const total = await productModel.countWatchList(userID);
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
        //check í new product. (3 days)
        const now = new Date();
        const date1 = moment.utc(now).format('MM/DD/YYYY')
        const date2 = moment.utc(obj.UploadDate).format('MM/DD/YYYY')
        const diffTime = Math.abs(new Date(date1)- new Date(date2));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3){
            obj.isNew = true
        }
        else
            obj.isNew = false

        //number of auction.
        const numberofAuction = await productModel.getNumberofAuctionByProID(obj.ProID)
        if(numberofAuction === null){
            obj.numberAuction = 0
        }else{
            obj.numberAuction = numberofAuction.NumberOfAuction
        }

        //hisghest bidder.
        const highestBidder =  await productModel.getUsernameMaxPriceByProID(obj.ProID)
        if (highestBidder === null){
            obj.highestBidder = 'None'
        }else{
            obj.highestBidder = highestBidder.Username
        }
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

router.post('/appendDescription/:id', async function(req, res){
    const url = req.headers.referer || '/'
    const info = req.body.Info
    const proID = req.params.id
    const now = new Date()
    productModel.InsertNewDescriptionByProID(proID, now, info)

    res.redirect(url)
})

router.post('/addWatchList', async function (req, res){
    req.session.retURL = req.originalUrl
    const id = req.body.ProID;

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
    const url = req.headers.referer || '/'
    if (url.includes("http://localhost:3000/products/WatchList")){
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
// Khang

//deny request.
router.post('/denyRequest', async function(req, res){
    const proID = req.query.ProID
    const userID = req.query.UserID


    //send OTP emails.
    var transporter = mails.createTransport({
        service: 'gmail',
        auth: {
            user: 'khuong16lop9a6@gmail.com',
            pass: '0903024916'
        }
    });

    //send deny request
    const proName = await productModel.getProNameByProID(proID);
    const mail = await productModel.getEmailByUserID(userID)
    const maxPrice = await productModel.getMaxPriceByUserIDProID(proID, userID)

    var mailOptions = {
        from: 'khuong16lop9a6@gmail.com',
        to: mail.Email,
        subject: 'Bidding Wep App: Bạn bị từ chối lượt ra giá',
        text: 'Sản phẩm có mã ('+ proID +'): ' + proName.ProName +' với giá tiền ' + maxPrice.MaxPrice +' đã bị người bán từ chối ra giá.\nNgoài ra bạn không thể tiếp tục đấu giá sản phẩm này.'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    const MaxBidder = await productModel.getMaxBidderByProID(proID)
    console.log(MaxBidder.length)
    if (MaxBidder.length === 1) {
        console.log('hello')
        const oldPrice = await productModel.getAuctionPriceByProIDOneBidder(proID, userID)
        await productModel.updateCurrentPriceByProID(proID, oldPrice[0].Price)
        await productModel.deleteMaxPriceByProIDUserID(proID, userID)
        await productModel.updateStatusAuctionByUserID(userID)
        const url = req.headers.referer || '/'
        res.redirect(url)
    }
    else{
        // //is highest bidder.
        const maxPriceByProID = await productModel.getMaxPriceByProID(proID)
        const highestBidder = await productModel.getUserIDHasMaxPrice(proID, maxPriceByProID[0].MaxPrice);

        if (userID === highestBidder.UserID){
            const secondPrice = await productModel.getSecondPriceInAuction(proID)
            console.log(secondPrice.Price)
            await productModel.updateCurrentPriceByProID(proID, secondPrice.Price)
            await productModel.deleteMaxPriceByProIDUserID(proID, userID)
        }else {
            const maxPriceByProID = await productModel.getMaxPriceByProID(proID)
            const secondBidder = await productModel.getUserIDHasMaxPrice(proID, maxPriceByProID[1].MaxPrice);

            // const highestBidder = await productModel.getUserIDHasMaxPrice(proID, maxPriceByProID[0].MaxPrice);
            if (userID === secondBidder.UserID) {
                const thirdPrice = await productModel.getThirdPriceInMaxPrice(proID)
                if (thirdPrice == null) {
                    const stepPrice = await productModel.getStepPriceByProID(proID)
                    const oldPrice = await productModel.getAuctionPriceByProID(proID, userID)
                    await productModel.updateCurrentPriceByProID(proID, oldPrice[0].Price)
                    await productModel.updateAuctionPriceMaxBidder(proID, highestBidder.UserID, oldPrice[0].Price)
                    await productModel.deleteMaxPriceByProIDUserID(proID, userID)
                } else {
                    const stepPrice = await productModel.getStepPriceByProID(proID)
                    await productModel.updateCurrentPriceByProID(proID, thirdPrice.MaxPrice + stepPrice[0].StepPrice)
                    await productModel.updateAuctionPriceMaxBidder(proID, highestBidder.UserID, thirdPrice.MaxPrice + stepPrice[0].StepPrice)
                    await productModel.deleteMaxPriceByProIDUserID(proID, userID)
                }
            }
        }
        await productModel.updateStatusAuctionByUserID(userID)
        const url = req.headers.referer || '/'
        res.redirect(url)
    }
})


//approve request new bidder
router.post('/approveRequest', async function(req, res){
    const proID = req.query.ProID
    console.log(proID)
    const userID = req.query.UserID
    console.log(userID)
    const mail = await productModel.getEmailByUserID(userID)
    const proName = await productModel.getProNameByProID(proID)
    const time = new Date()
    sellerModels.updateStatusPermission(userID, proID, time);
//send OTP emails.
    var transporter = mails.createTransport({
        service: 'gmail',
        auth: {
            user: 'khuong16lop9a6@gmail.com',
            pass: '0903024916'
        }
    });

    //send email
    console.log(mail.Email)
    var mailOptions = {
        from: 'khuong16lop9a6@gmail.com',
        to: mail.Email,
        subject: 'Bidding Wep App: Người bán ra đồng ý cho phép bạn ra giá!',
        text: 'Sản phẩm có mã ('+ proID +'): ' + proName.ProName + '. Bạn dã có thể ra giá cho sản phẩm này!'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    const url = req.headers.referer || '/'
    res.redirect(url)
})


//approve request new bidder
router.post('/denyRequestFirstTime', async function(req, res){
    const proID = req.query.ProID
    const userID = req.query.UserID
    const mail = await productModel.getEmailByUserID(userID)
    const proName = await productModel.getProNameByProID(proID)
    const time = new Date()
    sellerModels.updateStatusDenyPermission(userID, proID, time);
//send OTP emails.
    var transporter = mails.createTransport({
        service: 'gmail',
        auth: {
            user: 'khuong16lop9a6@gmail.com',
            pass: '0903024916'
        }
    });

    //send email
    var mailOptions = {
        from: 'khuong16lop9a6@gmail.com',
        to: mail.Email,
        subject: 'Bidding Wep App: Người bán ra không đồng ý cho phép bạn ra giá!',
        text: 'Sản phẩm có mã ('+ proID +'): ' + proName.ProName + '. Bạn không thể ra giá cho sản phẩm này!'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    const url = req.headers.referer || '/'
    res.redirect(url)
})
//history
router.get('/history', async function (req, res){
    req.session.retURL = req.originalUrl
    const ProID = req.query.ProID;
    const type = req.query.show;
    const page = req.query.page || 1;
    var lst = [];
    if (type === undefined || type === "top-5"){
        var display = false;
        lst = await productModel.getAuctionByProIDWithLimit(ProID, 5, 0);
    }
    else{
        var display = true;
        const offset = (page-1)*6;
        const length = await productModel.getLengthAuction(ProID);
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
            lst = await productModel.getAuctionByProIDWithLimit(ProID, 6, offset);
        }
    }
    for (var i = 0; i < lst.length; i++) {
        lst[i].No = (i + 1) + (page - 1) * 6;
    }
    const product = await productModel.getProductByProID(ProID)
    const catid2 = await productModel.getCatID2FromProID(ProID)
    const catid1 =  await productModel.getCatID1FromCatID2(catid2.CatID2)
    res.render('vwProducts/history', {
        Users: lst,
        ProID,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        display,
        product,
        CatID1: catid1.CatID1
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
        await bidderModels.insertToPermission(entity);
    }
    else{
        const entity = {
            UserID: res.locals.authUser.UserID,
            ProID: req.params.id,
            MaxPrice: req.body.txtPrice,
            Time: d
        };
        const product = await productModel.findById(entity.ProID);
        const endDate = new Date(product.EndDate);
        const diffTime = endDate.getTime() - d.getTime();
        console.log(diffTime);
        const priceList = await productModel.getMaxPriceByProID(entity.ProID);
        if (priceList.length === 0){
            await bidderModels.insertMaxPrice(entity);
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
            await productModel.insertAuction(new_entity);
            await productModel.updatePriceProduct(new_entity);
            if (req.body.txtBuyNow !== undefined)
                await productModel.updateWinnerProduct(new_entity);
            if (diffTime <= 300000 && product.AutoExtendTime === 1)
                await productModel.updateProductEndTime(product.ProID, new Date(endDate.setMinutes(endDate.getMinutes()+10)));
            await FuncMdw.sendEmail(new_entity.UserID, `Bạn đã đấu giá thành công sản phẩm ${new_entity.ProID} với mức giá ${new_entity.Price}`);
            await FuncMdw.sendEmail(product.UploadUser, `Sản phẩm ${new_entity.ProID} hiện đang có mức giá ${new_entity.Price} giữ bởi người dùng ${new_entity.UserID}`);
        }
        else{
            const obj = await bidderModels.selectMaxPrice(entity);
            if (obj[0].Num !== 0)
                await bidderModels.updateMaxPrice(entity);
            else
                await bidderModels.insertMaxPrice(entity);
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
                    await productModel.insertAuction(new_entity);
                    await productModel.updatePriceProduct(new_entity);
                    if (req.body.txtBuyNow !== undefined)
                        await productModel.updateWinnerProduct(new_entity);
                    if (diffTime <= 300000 && product.AutoExtendTime === 1)
                        await productModel.updateProductEndTime(product.ProID, new Date(endDate.setMinutes(endDate.getMinutes()+10)));
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
                    await productModel.insertAuction(new_entity);
                    await productModel.updatePriceProduct(new_entity);
                    await productModel.updateWinnerProduct(new_entity);
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

router.get("/AuctionList", auth, async function (req, res){
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
    for (let i = 0; i < ProIDList.length; i++){
        const product = await productModel.findById(ProIDList[i].ProID);
        const auction = await productModel.getAuctionByProID(ProIDList[i].ProID);
        if (auction[0].UserID === userID)
            product.Show = 1;
        list.push(product);
    }

    for (const obj of list){
        const CatID2 = obj.CatID2;
        const CatID1 = await productModel.getCatID1FromCatID2(CatID2);
        obj.CatID1 = CatID1.CatID1;
    }
    //get highest bidder + number of auction
    for(const c of list){
        const highestBidder =  await productModel.getUsernameMaxPriceByProID(c.ProID)
        if (highestBidder === null){
            c.highestBidder = 'None'
        }else{
            c.highestBidder = highestBidder.Username
        }

        const numberofAuction = await productModel.getNumberofAuctionByProID(c.ProID)
        if(numberofAuction === null){
            c.numberAuction = 0
        }else{
            c.numberAuction = numberofAuction.NumberOfAuction
        }

        //check í new product. (3 days)
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
    }

    //check which product selected in watch list
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

    res.render('vwProducts/auctionList', {
        products: list,
        empty: list.length === 0,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        isLogin
    })
});

//Khang
router.get('/WinList', auth,async function(req, res){
    req.session.retURL = req.originalUrl;
    const userID = res.locals.authUser.UserID;

    const limit = 3
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const total = res.locals.lengthOfWinningList;
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

    const list = await productModel.getWinningListWithLimitOffset(userID, limit, offset);

    for (const obj of list){
        const CatID2 = obj.CatID2;
        const CatID1 = await productModel.getCatID1FromCatID2(CatID2);
        obj.CatID1 = CatID1.CatID1;
    }
    //check wwhich product selected in watch list
    if (res.locals.WatchListByUSerID != null){
        for(const c of list){
            for (const d of res.locals.WatchListByUSerID){
                if (c.ProID === d.ProID){
                    c.isWatchList = 1;
                }
            }
        }
    }
    const isLogin = req.session.auth || false

    res.render('vwProducts/winList', {
        products: list,
        empty: list.length === 0,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        isLogin
    })
})
export default router;