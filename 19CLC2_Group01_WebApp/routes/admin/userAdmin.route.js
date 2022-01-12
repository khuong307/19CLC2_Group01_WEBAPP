//admin/user
// MINH
import express from 'express';
import userModel from '../../models/user.models.js';
import accountModel from "../../models/account.models.js";
import auth from "../../middlewares/auth.mdw.js";
import mails from "nodemailer";
import BCrypt from 'bcrypt'

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
            user: 'khuong16lop9a6@gmail.com',
            pass: '0903024916'
        }
    });

    var mailOptions = {
        from: 'khuong16lop9a6@gmail.com',
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
            user: 'khuong16lop9a6@gmail.com',
            pass: '0903024916'
        }
    });

    var mailOptions = {
        from: 'khuong16lop9a6@gmail.com',
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

// Reset Password Seller
router.post('/seller/detail/resetpass',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const userID = req.query.id
    // Lấy thông tin user
    const userInfo=await accountModel.getUserInfo(userID);
    // láy ra email user
    const email=userInfo.Email;
    // Tạo password mới
    const newPass = "12345";
    const newHashPass = BCrypt.hashSync(newPass, 10);
    accountModel.UpdatePassByUserID(userID, newHashPass);

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
        subject: 'Bidding Wep App: Reset Password for account',
        text: 'Password của tài khoản bạn đã được reset. Password mặc định là '+newPass,
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.json({
        msg:"Reset password thành công",
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
            user: 'khuong16lop9a6@gmail.com',
            pass: '0903024916'
        }
    });

    var mailOptions = {
        from: 'khuong16lop9a6@gmail.com',
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

// Reset Password Bidder
router.post('/bidder/detail/resetpass',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const userID = req.query.id
    // Lấy thông tin user
    const userInfo=await accountModel.getUserInfo(userID);
    // láy ra email user
    const email=userInfo.Email;
    // Tạo password mới
    const newPass = "12345";
    const newHashPass = BCrypt.hashSync(newPass, 10);
    accountModel.UpdatePassByUserID(userID, newHashPass);

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
        subject: 'Bidding Wep App: Reset Password for account',
        text: 'Password của tài khoản bạn đã được reset. Password mặc định là '+newPass,
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.json({
        msg:"Reset password thành công",
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
            user: 'khuong16lop9a6@gmail.com',
            pass: '0903024916'
        }
    });

    var mailOptions = {
        from: 'khuong16lop9a6@gmail.com',
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

// Xóa tài khoản
router.post('/delete',async function(req,res){
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

    // Lấy danh sách ProID theo UserID trong bảng Product
    const listProID=await userModel.findProIDByUserID(userID);

    //gửi OTP emails.
    var transporter = mails.createTransport({
        service: 'gmail',
        auth: {
            user: 'khuong16lop9a6.com',
            pass: '0903024916'
        }
    });

    var mailOptions = {
        from: 'khuong16lop9a6@gmail.com',
        to: email,
        subject: 'Bidding Wep App: Xóa tài khoảnr',
        text: 'Tài khoản của bạn đã bị xóa khỏi hệ thống đấu giá trực tuyến'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    //Xóa bảng WatchList + User+Review+Product+Permission+MaxPrice+ChangeLevel+Auction+Account
    // Xóa đúng theo thứ tự --> Khóa ngoại --> Khóa chính
    const retWatchList=await userModel.deleteWatchList(userID);
    const retChangeLV=await userModel.deleteChangeLevel(userID);
    const retPer=await userModel.deletePermission(userID);
    const retReview=await userModel.deleteReview(userID);
    // Xóa những product được upload bởi user
    for(let i=0;i<listProID.length;i++){
        let ret2Permis=await productModel.delPermisByProId(listProID[i].ProID);
        let ret2MaxPrice=await productModel.delMaxPriceByProId(listProID[i].ProID);
        let ret2Auction=await productModel.delAuctionByProId(listProID[i].ProID);
        let ret2Description=await productModel.delDescriptionByProId(listProID[i].ProID);
        let ret2WatchList=await productModel.delWatchListByProId(listProID[i].ProID);
        let ret2ProInfo=await productModel.delProInfoSearchByProId(listProID[i].ProID);
        let ret2Product=await productModel.delProductByProId(listProID[i].ProID);
    }
    const retAuction=await userModel.deleteAuction(userID);
    const retMaxPrice=await userModel.deleteMaxPrice(userID);
    const retProduct=await userModel.deleteProduct(userID);

    const retUser=await userModel.deleteUser(userID);
    const retAcc = await userModel.deleteAccount(userID);

    res.json({
        msg:"Xóa tài khoản thành công",
        status:1,
    });
})

export default router;