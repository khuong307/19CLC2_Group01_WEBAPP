//admin/user
// MINH
import express from 'express';
import userModel from '../../models/user.models.js';
import accountModel from "../../models/account.models.js";
import auth from "../../middlewares/auth.mdw.js";
import mails from "nodemailer";

const router = express.Router();

router.get('/', auth,async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;
    res.render('admin/vwUser/menuUser');
})

// SELLER
// xem danh sách seller
router.get('/seller',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    // Paging
    const limit = 8
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const total = await userModel.countSeller()
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

    const sellerList = await userModel.findPageBySeller(limit, offset)

    res.render('admin/vwUser/sellerList',{
        sellerList:sellerList,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
    });
})


// get seller detail
router.get('/seller/detail',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const userID=req.query.id;
    const userInfo = await accountModel.getDetailUserInfo(userID);
    console.log(userInfo);
    res.render('admin/vwUser/detailSeller',{
        UserInfo:userInfo
    })
})

// Giảm cấp seller thành bidder
router.post('/seller/downgrade',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const userID=req.query.id;
    // Lấy thông tin user
    const userInfo=await accountModel.getUserInfo(userID);
    // láy ra email user
    const email=userInfo.Email;

    //gửi OTP emails.
    var transporter = mails.createTransport({
        service: 'gmail',
        auth: {
            user: 'binhkggffs@gmail.com',
            pass: '01051993qwe'
        }
    });

    var mailOptions = {
        from: 'binhkggffs@gmail.com',
        to: email,
        subject: 'Bidding Wep App: Giảm cấp Seller thành Bidder',
        text: 'Tài khoản của bạn đã bị giảm cấp từ Seller thành Bidder'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    const ret=await userModel.downgradeSeller(userID);
    // Tạo đối tượng để insert vào bảng ChangeLevel
    let now= new Date();
    const entity={
        UserID:userID,
        Time:now,
        Change:0,
        Status:1,
        AcceptTime:now
    }
    const ret2=await userModel.insertDownSeller(entity);
    res.json({
        msg:"Giảm cấp thành công",
        status:1,
    });
})

// Vô hiệu hóa tài khoản seller
router.post('/seller/disable',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const userID=req.query.id;
    // Lấy thông tin user
    const userInfo=await accountModel.getUserInfo(userID);
    // láy ra email user
    const email=userInfo.Email;

    // Chỉnh activate thành -1 --> Khóa tài khoản
    const ret=await userModel.disableAccount(userID);

    //gửi OTP emails.
    var transporter = mails.createTransport({
        service: 'gmail',
        auth: {
            user: 'binhkggffs@gmail.com',
            pass: '01051993qwe'
        }
    });

    var mailOptions = {
        from: 'binhkggffs@gmail.com',
        to: email,
        subject: 'Bidding Wep App: Disable account',
        text: 'Tài khoản của bạn đã bị khóa'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.json({
        msg:"Vô hiệu hóa tài khoản thành công",
        status:1,
    });
})

// BIDDER
// Xem danh sách bidder
router.get('/bidder',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;
    const userID=res.locals.authUser.UserID;

    // Paging
    const limit = 8
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const total = await userModel.countBidderExceptAdmin(userID)
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

    const bidderList = await userModel.findPageByBidderExAdmin(userID,limit, offset)

    res.render('admin/vwUser/bidderList',{
        bidderList,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
    });
})

// get bidder detail
router.get('/bidder/detail',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const userID=req.query.id;
    const userInfo = await accountModel.getDetailUserInfo(userID);
    res.render('admin/vwUser/detailBidder',{
        UserInfo:userInfo
    })
})

// Vô hiệu hóa tài khoản bidder
router.post('/bidder/disable',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const userID=req.query.id;
    // Lấy thông tin user
    const userInfo=await accountModel.getUserInfo(userID);
    // láy ra email user
    const email=userInfo.Email;

    // Chỉnh activate thành -1 --> Khóa tài khoản
    const ret=await userModel.disableAccount(userID);

    //gửi OTP emails.
    var transporter = mails.createTransport({
        service: 'gmail',
        auth: {
            user: 'binhkggffs@gmail.com',
            pass: '01051993qwe'
        }
    });

    var mailOptions = {
        from: 'binhkggffs@gmail.com',
        to: email,
        subject: 'Bidding Wep App: Disable account',
        text: 'Tài khoản của bạn đã bị khóa'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.json({
        msg:"Vô hiệu hóa tài khoản thành công",
        status:1,
    });
})


// UPGRADE BIDDER
// hiện danh sách bidder chờ upgrade
router.get('/upgrade',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    // Paging
    const limit = 8
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const total = await userModel.countUpgradeBidder()
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

    const upgradeList = await userModel.findPageByUpgradeBidder(limit, offset)
    console.log(upgradeList)

    res.render('admin/vwUser/upgradeList',{
        upgradeList,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
        empty: upgradeList.length == 0
    });
})

// chấp nhận bidder thành seller
router.post('/upgrade/accept',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const userID=req.query.id;

    // Lấy info user
    const userInfo=await accountModel.getUserInfo(userID);
    // láy ra email user
    const email=userInfo.Email;

    //gửi OTP emails.
    var transporter = mails.createTransport({
        service: 'gmail',
        auth: {
            user: 'binhkggffs@gmail.com',
            pass: '01051993qwe'
        }
    });

    var mailOptions = {
        from: 'binhkggffs@gmail.com',
        to: email,
        subject: 'Bidding Wep App: Nâng cấp thành Seller',
        text: 'Tài khoản của bạn đã được duyệt yêu cầu thành Seller. Từ giờ bạn đã có thể đăng bán sản phẩm mình thích'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    const entity=await userModel.findChangeLevelByID(userID);
    // Update bảng Change Level
    entity["Status"]=1;
    let now= new Date();
    entity["AcceptTime"]=now;
    const ret=await userModel.upgradeChangeLevel(entity);
    // Update bảng Account
    const ret2=await userModel.upgradeAccToSeller(userID);
    res.json({
        msg:"Chấp nhận thành công",
        status:1,
    });
})


// Hủy yêu cầu bidder thành seller
router.post('/upgrade/deny',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const userID=req.query.id;

    // Lấy info user
    const userInfo=await accountModel.getUserInfo(userID);
    // láy ra email user
    const email=userInfo.Email;

    //gửi OTP emails.
    var transporter = mails.createTransport({
        service: 'gmail',
        auth: {
            user: 'khuong16lop9a6@gmail.com',
            pass: '0903024916'
        }
    });

    var mailOptions = {
        from: 'khuong16lop9a6@gmail.com',
        to: email,
        subject: 'Bidding Wep App: Hủy nâng cấp thành Seller',
        text: 'Tài khoản của bạn không được admin chấp nhận thành Seller'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    const entity=await userModel.findChangeLevelByID(userID);
    // Update bảng Change Level
    entity["Status"]=2;
    let now= new Date();
    entity["AcceptTime"]=now;
    // Vẫn dùng hàm upgradeChangeLevel
    const ret=await userModel.upgradeChangeLevel(entity);
    res.json({
        msg:"Hủy yêu cầu thành công",
        status:1,
    });
})


export default router;