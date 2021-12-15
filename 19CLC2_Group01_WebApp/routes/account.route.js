import express from 'express';
import accountModel from '../models/account.models.js'
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
    let number = parseInt(id_present[0].NumberOfUser) + 1;
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
    res.render('vWAccount/OTPConfirm')

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
        return res.redirect('/account/login')
    }else{
        return res.render('vWAccount/OTPConfirm',{
            err_message: 'Mã OTP không khớp!'
        })
    }
})


//login.
router.get('/login', async function(req, res){
    res.render('vWAccount/login', {
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
    const url = req.session.retURL || req.originalUrl;
    res.redirect(url)
})

//forget pass
router.get('/forgetPass', async function(req, res){
    res.render('vWAccount/forgetPass', {
        layout: false
    })
})

router.post('/forgetPass', async function(req, res){
    const email = req.body.Email;
    console.log(email)

    const email_check = await accountModel.checkEmailInUser(email);
    if (email_check === null){
        res.render('vWAccount/forgetPass', {
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

    res.render('vWAccount/forgetPass', {
        layout: false
    })
})

//OTP CHECK.
router.get('/OTPPassword/:email', async function(req, res){
    res.render('vWAccount/OTPPassConfirm', {
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
        return res.render('vWAccount/OTPPassConfirm',{
            layout: false,
            err_message: 'Mã OTP không hợp lệ'
        })
    }
})

//OTP new pass.
router.get('/newPassword/:email', async function(req, res){
    res.render('vWAccount/newPassword', {
        layout: false
    })

})
router.post('/newPassword/:email', async function(req, res){
    const email = req.params.email
    console.log(email)
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
    const userID = req.session.authUser.UserID

    const UserInfo = await accountModel.getUserInfo(userID)
    console.log(UserInfo)
    res.render('vWAccount/profile',{
        UserInfo
    })
})
//update usser information
router.post('/profile', auth, async function(req, res){
    const userID = req.session.authUser.UserID
})

//change password.
router.get('/changePassword', auth, async function(req, res){
    const userID = req.session.authUser.UserID || "0"

    const UserInfo = await accountModel.getUserInfo(userID)
    console.log(UserInfo)
    res.render('vWAccount/changePassword',{
        UserInfo
    })
})

router.post('/changePassword', auth, async function(req, res){
    const userID = req.session.authUser.UserID

    const UserInfo = await accountModel.getPasswordByUserID(userID)
    console.log(UserInfo.Password)
    const oldPass = req.body.oldPassword;
    const newPass = req.body.newPassword;
    const checkPass = BCrypt.compareSync(oldPass, UserInfo.Password)
    if(checkPass === false){
        return res.render('vWAccount/changePassword',{
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
export default router;