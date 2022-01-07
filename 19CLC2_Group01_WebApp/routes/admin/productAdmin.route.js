//admin/products
import express from 'express';
import productModel from '../../models/product.models.js';
import auth from "../../middlewares/auth.mdw.js";
import mails from "nodemailer";

const router = express.Router();

// Xem list sản phẩm
router.get('/', auth,async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const list = await productModel.findAllWithIdCate()
    res.render('admin/vwProductAdmin/productList', {
        products: list
    })
})

// Xóa sản phẩm thông qua table
router.post('/del',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    // Lấy ProID trong query string
    const ProID=req.query.id;
    // Lấy full thông tin Product
    const ProInfo=await productModel.findById(ProID);
    // Lấy danh sách những bidder đặt sản phẩm đó
    const UserInfo=await productModel.findBidderByProId(ProID);
    // Lấy danh sách seller bán sản phẩm
    const SellerInfo=await productModel.findSellerByProId(ProID);

    // lưu email của seller và bidder vào array
    let listMailUser=[];
    for(let i=0;i<UserInfo.length;i++){
        listMailUser.push(UserInfo[i].Email);
    }
    // Vì sản phẩm chỉ có 1 người đăng bán nên ta lấy 0 --> Phần tử 0 của json
    listMailUser.push(SellerInfo[0].Email);
    // Gửi mail
    for(let i=0;i<listMailUser.length;i++){
        sendEmail(listMailUser[i],ProInfo.ProName);
    }

    //Xóa bảng Permission + MaxPrice+Auction+Description+WatchList+ProInfo+Product
    // Xóa đúng theo thứ tự --> Khóa ngoại --> Khóa chính
    const retPermis=await productModel.delPermisByProId(ProID);
    const retMaxPrice=await productModel.delMaxPriceByProId(ProID);
    const retAuction=await productModel.delAuctionByProId(ProID);
    const retDescription=await productModel.delDescriptionByProId(ProID);
    const retWatchList=await productModel.delWatchListByProId(ProID);
    const retProInfo=await productModel.delProInfoSearchByProId(ProID);
    const retProduct=await productModel.delProductByProId(ProID);

    res.json({
        msg:"Xóa thành công",
        status:1,
    });
})

// Xóa sản phẩm thông qua view ByCat
router.post('/delView',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    // Lấy url để redirect lại chính trang này
    const url = req.headers.referer || '/';

    // Lấy ProID trong query string
    const ProID=req.query.id;
    console.log(ProID);
    // Lấy full thông tin Product
    const ProInfo=await productModel.findById(ProID);
    // Lấy danh sách những bidder đặt sản phẩm đó
    const UserInfo=await productModel.findBidderByProId(ProID);
    // Lấy danh sách seller bán sản phẩm
    const SellerInfo=await productModel.findSellerByProId(ProID);

    // lưu email của seller và bidder vào array
    let listMailUser=[];
    for(let i=0;i<UserInfo.length;i++){
        listMailUser.push(UserInfo[i].Email);
    }
    // Vì sản phẩm chỉ có 1 người đăng bán nên ta lấy 0 --> Phần tử 0 của json
    listMailUser.push(SellerInfo[0].Email);
    // Gửi mail
    for(let i=0;i<listMailUser.length;i++){
        sendEmail(listMailUser[i],ProInfo.ProName);
    }

    //Xóa bảng Permission + MaxPrice+Auction+Description+WatchList+ProInfo+Product
    // Xóa đúng theo thứ tự --> Khóa ngoại --> Khóa chính
    const retPermis=await productModel.delPermisByProId(ProID);
    const retMaxPrice=await productModel.delMaxPriceByProId(ProID);
    const retAuction=await productModel.delAuctionByProId(ProID);
    const retDescription=await productModel.delDescriptionByProId(ProID);
    const retWatchList=await productModel.delWatchListByProId(ProID);
    const retProInfo=await productModel.delProInfoSearchByProId(ProID);
    const retProduct=await productModel.delProductByProId(ProID);

    res.redirect(url);
})

function sendEmail(email,ProName){
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
        subject: 'Bidding Wep App: Xóa sản phẩm đang đấu giá',
        text: 'Sản phẩm '+ ProName +' đã bị xóa vì vi phạm các tiêu chuẩn đăng bán trên website'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

export default router;