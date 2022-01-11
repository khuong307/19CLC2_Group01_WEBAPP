import express from 'express';
import accountModel from '../models/account.models.js'
import productModel from "../models/product.models.js";
import BCrypt from 'bcrypt'
import moment from "moment";
import mails from 'nodemailer'
import auth from '../middlewares/auth.mdw.js'

const router = express.Router();
//register.
router.get('/register', async function(req, res){
    for (const d of res.locals.CategoryL1){ // count tổng số lượng sản phẩm trong 1 CategoryL1.
        d.numberPro = 0;
        for (const c of res.locals.lcCategories){
            if (d.CatID1 === c.CatID1){
                d.numberPro += c.ProductCount;
            }
        }
    }
    res.render('vWAccount/register')
})
//send email;

router.post('/register', async function(req, res){

    let newUserID = 0;
    const id_present = await accountModel.countUser();
    const stt = id_present.UserID.slice(1, 4);
    let number = parseInt(stt) + 1;
    if ( number>= 100){
        newUserID = "U" + number
    }
    else if (number >= 10){
        newUserID = "U0" + number
    }
    else{
        newUserID = "U00" + number
    }

    //Account Info
    const username = req.body.Username
    const password = req.body.Password
    const hashPass = BCrypt.hashSync(password, 10);
    const newAccount = {
        Username: username,
        UserID: newUserID,
        Password: hashPass,
        Type: 1,
        Activate: 0
    }
    accountModel.addNewAccount(newAccount)

    //User Info
    const name = req.body.Name
    const address = req.body.Address;
    const dob = moment(req.body.Dob, 'MM/DD/YYYY').format('YYYY/MM/DD');
    const email = req.body.Email;
    const newUser = {
        UserID: newUserID,
        Name: name,
        Dob: dob,
        Address: address,
        Email: email,
        LikePoint: 0,
        DislikePoint: 0,
    }

    //send OTP emails.
    var transporter = mails.createTransport({
        service: 'gmail',
        auth: {
            user: 'khuong16lop9a6@gmail.com',
            pass: '0903024916'
        }
    });
    accountModel.addNewUser(newUser)

    //random OTP:
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 4; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }

    var mailOptions = {
        from: 'khuong16lop9a6@gmail.com',
        to: email,
        subject: 'Bidding Wep App: Confirm your email',
        text: 'Mã xác nhận OTP: ' + OTP
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    transporter.close()

    const OTPConfirm = {
        Email: email,
        OTPCode: OTP
    }
    accountModel.InsertOTP(OTPConfirm)

    res.redirect(`OTP/${email}`)
})


router.get('/is_available_account', async function(req, res){
    const email = req.query.email;
    const username = req.query.username;
    const user_email = await accountModel.findByEmail(email);
    const user_name = await accountModel.findByUsername(username);

    if(user_email===null && user_name===null){
        return res.json(false);
    }
    res.json(true);
})

//OTP CHECK.
router.get('/OTP/:email', async function(req, res){
    res.render('vwAccount/OTPConfirm')

})

router.post('/OTP/:email', async function(req, res){
    const email = req.params.email || 0
    const data = await accountModel.findOTPByEmail(email);
    const OTP = req.body.OTP;
    const OTP_length = OTP.length;
    const OTP_value = parseInt(OTP);

    if (OTP_value === data.OTPCode && OTP_length === 4){
        const username = await accountModel.findUserIDByEmail(email)
        accountModel.UpdateActivateAccountByUserID(username.UserID)
        accountModel.deleteOTPLogin(email)

        return res.redirect('/account/login')
    }else{
        return res.render('vwAccount/OTPConfirm',{
            err_message: 'Mã OTP không khớp!'
        })
    }
})


//login.
router.get('/login', async function(req, res){
    res.render('vwAccount/login', {
        layout:false
    })
})

router.post('/login', async function(req, res){
    const username = req.body.Username
    const password = req.body.Password

    const user = await accountModel.getAccountInfoByUsername(username)
    if(user === null){
        return res.render('vwAccount/login', {
            layout: false,
            err_message: 'Username và mật khẩu không hợp lệ!'
        })
    }

    const checkPass = BCrypt.compareSync(password, user.Password)
    if(checkPass===false){
        return res.render('vwAccount/login', {
            layout: false,
            err_message: 'Username và mật khẩu không hợp lệ!'
        })
    }

    delete user.Password;
    req.session.auth = true
    req.session.authUser = user
    //check if seller still have time left
    if(user.Type === 2){
        //getAcceptDate.
        const validDate = await accountModel.getSellerTimeValidByUserID(user.UserID)
        const now = new Date();
        const date1 = moment.utc(now).format('MM/DD/YYYY')
        const date2 = moment.utc(validDate.AcceptTime).format('MM/DD/YYYY')
        const diffTime = Math.abs(new Date(date1)- new Date(date2));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        req.session.authUser.validTime = 7-diffDays;
        console.log(diffDays)
        if (diffDays === 7){
            accountModel.updateSellerOutDate(user.UserID)
            req.session.authUser.Type = 1
        }
    }


    const url = req.session.retURL || req.originalUrl;
    res.redirect(url)
})

//forget pass
router.get('/forgetPass', async function(req, res){
    res.render('vwAccount/forgetPass', {
        layout: false
    })
})

router.post('/forgetPass', async function(req, res){
    const email = req.body.Email;

    const email_check = await accountModel.checkEmailInUser(email);
    if (email_check === null){
        res.render('vwAccount/forgetPass', {
            layout: false,
            err_message: 'Email không tồn tại!'
        })
    }
    else{
        //send OTP emails.
        var transporter = mails.createTransport({
            service: 'gmail',
            auth: {
                user: 'khuong16lop9a6@gmail.com',
                pass: '0903024916'
            }
        });

        //random OTP:
        var digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < 4; i++ ) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }

        var mailOptions = {
            from: 'khuong16lop9a6@gmail.com',
            to: email,
            subject: 'Bidding Wep App: Sửa đổi mật khẩu',
            text: 'Mã xác nhận OTP: ' + OTP
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        const OTPConfirm = {
            Email: email,
            OTPCode: OTP
        }
        accountModel.InsertForgetPassOTP(OTPConfirm)
        res.redirect(`OTPPassword/${email}`)
    }

    res.render('vwAccount/forgetPass', {
        layout: false
    })
})

//OTP CHECK.
router.get('/OTPPassword/:email', async function(req, res){
    res.render('vwAccount/OTPPassConfirm', {
        layout: false
    })

})

router.post('/OTPPassword/:email', async function(req, res){
    const email = req.params.email || 0
    const data = await accountModel.findOTPByEmailForgetPass(email);
    const OTP = req.body.OTP;
    const OTP_length = OTP.length;
    const OTP_value = parseInt(OTP);

    if (OTP_value === data.OTPCode && OTP_length === 4){
        const username = await accountModel.findUserIDByEmail(email)
        return res.redirect(`/account/newPassword/${email}`)
    }else{
        return res.render('vwAccount/OTPPassConfirm',{
            layout: false,
            err_message: 'Mã OTP không hợp lệ'
        })
    }
})

//OTP new pass.
router.get('/newPassword/:email', async function(req, res){
    res.render('vwAccount/newPassword', {
        layout: false
    })

})
router.post('/newPassword/:email', async function(req, res){
    const email = req.params.email
    const password = req.body.newPassword;
    const hashPass = BCrypt.hashSync(password, 10);
    const userID = await accountModel.findUserIDByEmail(email)

    accountModel.UpdatePassByUserID(userID.UserID, hashPass);
    accountModel.DelOTPCodeForget(email)
    res.redirect('/account/login');

})

//logout.
router.post('/logout', async function(req, res){
    req.session.auth = false
    req.session.authUser = null
    req.session.retURL = null

    const url = req.headers.referer || '/'
    res.redirect(url)
})


//profile.
//phục vụ chức năng chưa đăng nhập mà xem profile.

router.get('/profile', auth, async function(req, res){
    req.session.retURL = req.originalUrl
    const userID = req.session.authUser.UserID
    const UserInfo = await accountModel.getUserInfo(userID)
    res.render('vwAccount/profile',{
        UserInfo
    })
})
//update usser information
router.post('/profile', auth, async function(req, res){
    const userID = req.session.authUser.UserID
    const name = req.body.Name
    const address = req.body.Address
    const dob = req.body.Dob
    accountModel.updateProfileByUserID(userID, name, dob, address)
    const url = req.headers.referer || '/'
    res.redirect(url)

})

//change password.
router.get('/changePassword', auth, async function(req, res){
    const userID = req.session.authUser.UserID || "0"

    const UserInfo = await accountModel.getUserInfo(userID)
    res.render('vwAccount/changePassword',{
        UserInfo
    })
})

//change email.
router.get('/changeEmail', auth, async function(req, res){
    const userID = req.session.authUser.UserID || "0"
    const email = await accountModel.getEmailByUserID(userID)
    res.render('vwAccount/changeEmail',{
        Email: email.Email
    })
})

router.get('/OTPEmailConfirm/:email', auth, function(req, res){
    res.render('vwAccount/OTPEmailConfirm')
})

router.post('/OTPEmailConfirm/:email', auth, async function(req, res){
    const otp = req.body.OTP
    const email = req.params.email
    const real_otp = await accountModel.findOTPByEmail(email)

    if (otp.length != 4){
        res.render('vwAccount/OTPEmailConfirm',{
            err_message: "Mã OTP bao gồm 4 ký tự!"
        })
    }
    else if(parseInt(real_otp.OTPCode) != parseInt(otp)){
        res.render('vwAccount/OTPEmailConfirm',{
            err_message: "Mã OTP không khớp!"
        })
    }
    else{
        accountModel.deleteOTPLogin(email)
        accountModel.updateEmailByUserID(req.session.authUser.UserID,email)
        req.session.authUser = null;
        req.session.auth = null;
        res.redirect('/account/login')
    }
})

router.post('/changeEmail', auth, async function(req, res){
    const newEmail = req.body.newEmail
    //check new email already existed?
    const checkEmail = await accountModel.checkEmailInUser(newEmail)
    if (checkEmail === null){
        //send OTP emails.
        var transporter = mails.createTransport({
            service: 'gmail',
            auth: {
                user: 'khuong16lop9a6@gmail.com',
                pass: '0903024916'
            }
        });

        //random OTP:
        var digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < 4; i++ ) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }

        var mailOptions = {
            from: 'khuong16lop9a6@gmail.com',
            to: newEmail,
            subject: 'Bidding Wep App: Xác nhận thay đổi tài khoản email',
            text: 'Mã xác nhận OTP: ' + OTP
        };
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
        transporter.close()
        const OTPConfirm = {
            Email: newEmail,
            OTPCode: OTP
        }
        accountModel.InsertOTP(OTPConfirm)
        res.redirect(`/account/OTPEmailConfirm/${newEmail}`)
    }else {
        const userID = req.session.authUser.UserID || "0"
        const email = await accountModel.getEmailByUserID(userID)
        res.render('vwAccount/changeEmail',{
            Email: email.Email,
            err_message: "Tài khoản email này đã được sử dụng!"
        })
    }
})

router.post('/changePassword', auth, async function(req, res){
    const userID = req.session.authUser.UserID
    const UserInfo = await accountModel.getPasswordByUserID(userID)
    const oldPass = req.body.oldPassword;
    const newPass = req.body.newPassword;
    const checkPass = BCrypt.compareSync(oldPass, UserInfo.Password)
    if(checkPass === false){
        return res.render('vwAccount/changePassword',{
            err_message: 'Mật khẩu cũ không đúng!'
        })
    }
    else{
        const newHashPass = BCrypt.hashSync(newPass, 10);
        accountModel.UpdatePassByUserID(userID, newHashPass);
        req.session.authUser = null;
        req.session.auth = null;
        res.redirect('/account/login')

    }
})

//post search.
router.post('/search', async function(req, res){
    const content = req.body.content || "0"
    res.redirect(`search/${content}`)
})

//search by user
router.get('/search/:content', async function(req, res){
    req.session.retURL = req.originalUrl
    const content = req.params.content
    const proIDs = await productModel.searchProductFulltext(content)

    if( proIDs === null){
        return res.render('vwAccount/searchByUser',{
            empty: true,
            content,
        })
    }else{
        const limit = 6
        const page = req.query.page || 1 //Paging
        const offset = (page - 1) *limit

        const total = proIDs.length
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

        const list = await productModel.searchProductFullTextSearchWithLimitOffset(content, limit, offset)
        const resultList = [];
        for (const c of list){
            const d = await productModel.getProductByProID(c.ProID);
            resultList.push(d);
        }

        for(const d of resultList){
            const CatID2 = d.CatID2;
            const CatID1 = await productModel.getCatID1FromCatID2(CatID2);
            d.CatID1 = CatID1.CatID1;

            const highestBidder =  await productModel.getUsernameMaxPriceByProID(d.ProID)
            if (highestBidder === null){
                d.highestBidder = 'None'
            }else{
                d.highestBidder = highestBidder.Username
            }

            const numberofAuction = await productModel.getNumberofAuctionByProID(d.ProID)
            if(numberofAuction === null){
                d.numberAuction = 0
            }else{
                d.numberAuction = numberofAuction.NumberOfAuction
            }
            //check í new product. (3 days)
            const now = new Date();
            const date1 = moment.utc(now).format('MM/DD/YYYY')
            const date2 = moment.utc(d.UploadDate).format('MM/DD/YYYY')
            const diffTime = Math.abs(new Date(date1)- new Date(date2));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 3){
                d.isNew = true
            }
            else
                d.isNew = false
        }

        if (res.locals.WatchListByUSerID != null){
            for(const d of resultList){
                for (const c of res.locals.WatchListByUSerID){
                    if (d.ProID === c.ProID){
                        d.isWatchList = 1;
                    }
                }
            }
        }
        const isLogin = req.session.auth || false
        res.render('vwAccount/searchByUser',{
            empty: 0,
            resultList,
            content,
            isLogin,
            pageNumbers,
            currentPageIndex: page,
            isFirstPage: +page != 1,
            isLastPage: +page != nPages,
            type: 0
        })
    }
});

// search by price ascending
router.get('/search', async function(req, res){
    req.session.retURL = req.originalUrl
    const content = req.query.content
    const type = req.query.type

    //type = 1: price ascending, type =2, valid date descending.
    const proIDs = await productModel.searchProductFulltext(content)

    if( proIDs.length === 0){
        return res.render('vwAccount/searchByUser',{
            empty: true,
            content,
        })
    }else{
        const limit = 6
        const page = req.query.page || 1 //Paging
        const offset = (page - 1) *limit

        const total = proIDs.length
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
        var list = []
        if(type === '1'){
            list = await productModel.searchProductFullTextSearchType1(content, limit, offset)
        }
        else if (type === '2')
            list = await productModel.searchProductFullTextSearchType2(content, limit, offset)
        const resultList = [];
        for (const c of list){
            const d = await productModel.getProductByProID(c.ProID);
            resultList.push(d);
        }

        for(const d of resultList){
            const CatID2 = d.CatID2;
            const CatID1 = await productModel.getCatID1FromCatID2(CatID2);
            d.CatID1 = CatID1.CatID1;

            const highestBidder =  await productModel.getUsernameMaxPriceByProID(d.ProID)
            if (highestBidder === null){
                d.highestBidder = 'None'
            }else{
                d.highestBidder = highestBidder.Username
            }

            const numberofAuction = await productModel.getNumberofAuctionByProID(d.ProID)
            if(numberofAuction === null){
                d.numberAuction = 0
            }else{
                d.numberAuction = numberofAuction.NumberOfAuction
            }

            //check í new product. (3 days)
            const now = new Date();
            const date1 = moment.utc(now).format('MM/DD/YYYY')
            const date2 = moment.utc(d.UploadDate).format('MM/DD/YYYY')
            const diffTime = Math.abs(new Date(date1)- new Date(date2));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays <= 3){
                d.isNew = true
            }
            else
                d.isNew = false

        }

        if (res.locals.WatchListByUSerID != null){
            for(const d of resultList){
                for (const c of res.locals.WatchListByUSerID){
                    if (d.ProID === c.ProID){
                        d.isWatchList = 1;
                    }
                }
            }
        }
        const isLogin = req.session.auth || false
        var isLowtoHighPrice = 0;
        var isDateClose = 0;
        if(type === '1')
            isLowtoHighPrice = 1
        else if(type === '2')
            isDateClose = 1

        res.render('vwAccount/searchByUser',{
            empty: 0,
            isLowtoHighPrice,
            isDateClose,
            resultList,
            content,
            type,
            isLogin,
            pageNumbers,
            currentPageIndex: page,
            isFirstPage: +page != 1,
            isLastPage: +page != nPages
        })
    }
});


export default router;