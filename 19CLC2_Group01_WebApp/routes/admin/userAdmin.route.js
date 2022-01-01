//admin/user
// MINH
import express from 'express';
import userModel from '../../models/user.models.js';
import accountModel from "../../models/account.models.js";
import auth from "../../middlewares/auth.mdw.js";

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
    const sellerList=await userModel.findALlSeller();
    res.render('admin/vwUser/sellerList',{sellerList});
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
    const UserInfo = await accountModel.getUserInfo(userID);
    console.log(UserInfo)
    res.render('admin/vwUser/detailSeller',{
        UserInfo
    })
})

// Giảm cấp seller thành bidder
router.post('/seller/downgrade',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    const UserID=req.query.id;
    const ret=await userModel.downgradeSeller(UserID);
    // Tạo đối tượng để insert vào bảng ChangeLevel
    let now= new Date();
    const entity={
        UserID:UserID,
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
    const userID=req.query.id;
    const ret=await userModel.disableAccount(userID);
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
    const UserID=res.locals.authUser.UserID;
    const bidderList=await userModel.findAllBidderExceptAdmin(UserID);
    res.render('admin/vwUser/bidderList',{bidderList});
})

// get bidder detail
router.get('/bidder/detail',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    const userID=req.query.id;
    const UserInfo = await accountModel.getUserInfo(userID);
    console.log(UserInfo)
    res.render('admin/vwUser/detailBidder',{
        UserInfo
    })
})

// Vô hiệu hóa tài khoản bidder
router.post('/bidder/disable',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }

    const userID=req.query.id;
    const ret=await userModel.disableAccount(userID);
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
    const upgradeList=await userModel.findAllBidderUpgrade();
    res.render('admin/vwUser/upgradeList',{
        upgradeList
    });
})

// chấp nhận bidder thành seller
router.post('/upgrade/accept',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    const UserID=req.query.id;
    const entity=await userModel.findChangeLevelByID(UserID);
    // Update bảng Change Level
    entity["Status"]=1;
    let now= new Date();
    entity["AcceptTime"]=now;
    const ret=await userModel.upgradeChangeLevel(entity);
    // Update bảng Account
    const ret2=await userModel.upgradeAccToSeller(UserID);
    res.json({
        msg:"Chấp nhận thành công",
        status:1,
    });
})



export default router;