//middle-ware: sẽ được khởi động chạy trước khi vào file hbs,  để lên trước các app.get
import categoryModel from "../models/categories.models.js";
import productModels from "../models/product.models.js";
import bidderModels from "../models/bidder.models.js";
import accountModels from "../models/account.models.js";
import moment from "moment";
import FuncMdw from "../middlewares/func.mdw.js";


export default function(app){
    //khuong.
    app.use(async function(req, res, next){
        const productList = await productModels.findAll();
        const now = new Date();

        for (let i = 0; i < productList.length; i++){
            const endDate = new Date(productList[i].EndDate);
            if (now.getTime() > endDate.getTime() && productList[i].isSendEmail === 0){
                if (productList[i].Winner){
                    await FuncMdw.sendEmail(productList[i].UploadUser, `Người dùng ${productList[i].Winner} đã chiến thắng sản phẩm ${productList[i].ProName} với mức giá ${productList[i].CurrentPrice}`);
                    await FuncMdw.sendEmail(productList[i].Winner, `Bạn đã chiến thắng sản phẩm ${productList[i].ProName} với mức giá ${productList[i].CurrentPrice}`);
                }
                else{
                    await FuncMdw.sendEmail(productList[i].UploadUser, `Sản phẩm ${productList[i].ProName} đã kết thúc mà không có người đấu giá`);
                }
                await productModels.updateProductSendEmailStatus(productList[i].ProID);
            }
        }

        if(typeof (req.session.auth) === 'undefined'){
            req.session.auth = null;
        }
        if(typeof (req.session.authUser) === 'undefined'){
            req.session.authUser = null;
        }

        res.locals.auth = req.session.auth
        res.locals.authUser = req.session.authUser

        if(res.locals.authUser != null){
            if(res.locals.authUser.Type === 1){
                res.locals.actorBidder = 1;
            }
            else if (res.locals.authUser.Type === 2){
                res.locals.actorSeller = 1;
            }
            else if (res.locals.authUser.Type === 3){
                res.locals.actorAdmin = 1;
            }
        }

        if(res.locals.authUser != null){
            const userid = res.locals.authUser.UserID;
            const obj = await bidderModels.findById(userid);
            res.locals.upgrade = "Can upgrade";
            if (obj !== undefined && obj.Change === 1){
                if (obj.AcceptTime === null)
                    res.locals.upgrade = "Yêu cầu của bạn đã được gửi và đang chờ xử lý";
                else{
                    const now = new Date();
                    const sendDate = new Date(obj.AcceptTime);
                    const diffTime = now.getTime() - sendDate.getTime();
                    if (diffTime > 604800000){
                        const ret = await accountModels.updateActorById(userid, 1);
                        res.locals.authUser.Type = 1;
                    }
                    else{
                        res.locals.upgrade = "Bạn đã trở thành seller";
                    }
                }
            }
        }
        next()
    })
    //khuong

    app.use(async function(req, res, next){
        const lcCategories = await categoryModel.findAllWithDetails()
        res.locals.lcCategories = lcCategories //áp dụng biến local dùng được mọi nơi.


        const CategoryL1 = await categoryModel.findALlCategoryL1()
        res.locals.CategoryL1 = CategoryL1;
        for (const d of res.locals.CategoryL1){ // count tổng số lượng sản phẩm trong 1 CategoryL1.
            d.numberPro = 0;
            for (const c of res.locals.lcCategories){
                if (d.CatID1 === c.CatID1){
                    d.numberPro += c.ProductCount;
                }
            }
        }

        // Khang
        if(res.locals.authUser != null){
            const userID = res.locals.authUser.UserID;
            const watchList = await productModels.getWatchListByUserID(userID);
            const changeList = await bidderModels.findById(userID);
            const permissionList = await bidderModels.getPermissionByUserID(userID);
            const auctionList = await productModels.getAuctionByUserID(userID);
            var temp = [];
            const now = new Date();
            for (let i = 0; i < changeList.length; i++){
                changeList[i].Level = 1;
                if (changeList[i].Status === 1){
                    if (changeList[i].Change === 1){
                        let obj = JSON.parse(JSON.stringify(changeList[i]));
                        obj.DisplayChange = 1;
                        temp.push(obj);
                        if ((i === changeList.length-1) || (i !== changeList.length-1 && changeList[i+1].Change !== 0)){
                            const sendDate = new Date(changeList[i].AcceptTime);
                            const diffTime = now.getTime() - sendDate.getTime();
                            if (diffTime > 604800000){
                                let obj = JSON.parse(JSON.stringify(changeList[i]));
                                obj.DisplayChange = 0;
                                obj.RefuseChange = 0;
                                obj.AcceptTime = moment(sendDate).add(7, 'd');
                                temp.push(obj);
                            }
                        }
                    }
                    else{
                        let obj = JSON.parse(JSON.stringify(changeList[i]));
                        obj.DisplayChange = 0;
                        obj.RefuseChange = 0;
                        temp.push(obj);
                    }
                }
                else if (changeList[i].Status === 2){
                    let obj = JSON.parse(JSON.stringify(changeList[i]));
                    obj.DisplayChange = 0;
                    obj.RefuseChange = 1;
                    temp.push(obj);
                }
            }
            for (let i = 0; i < permissionList.length; i++){
                permissionList[i].Permission = 1;
                if (permissionList[i].Status === 1){
                    let obj = JSON.parse(JSON.stringify(permissionList[i]));
                    obj.DisplayPermission = 1;
                    temp.push(obj);

                }
                else if (permissionList[i].Status === 2){
                    let obj = JSON.parse(JSON.stringify(permissionList[i]));
                    obj.DisplayPermission = 0;
                    temp.push(obj);
                }
            }
            var auctionTemp = [];
            for (let i = 0; i < auctionList.length; i++){
                auctionList[i].Auction = 1;
                if (auctionList[i].Status === 0){
                    let obj = JSON.parse(JSON.stringify(auctionList[i]));
                    var flag = true;
                    for (let j = 0; j < auctionTemp.length; j++){
                        if (auctionTemp[j].ProID == obj.ProID){
                            flag = false;
                            break;
                        }
                    }
                    if (flag){
                        obj.DisplayAuction = 1;
                        temp.push(obj);
                        auctionTemp.push(obj);
                    }
                }
            }
            temp.sort(function(a,b){
                return new Date(a.AcceptTime) - new Date(b.AcceptTime);
            });
            res.locals.NotiListByUserID = temp.reverse();
            res.locals.lengthOfNotiList = temp.length;
            res.locals.WatchListByUSerID = watchList;
            if (watchList === null){
                res.locals.lengthOfWatchList = 0;
            }else{
                res.locals.lengthOfWatchList = watchList.length;
            }

            const current = now.toISOString().slice(0, 19).replace('T', ' ');
            const auctioningList = await productModels.getAuctioningList(userID, current);
            if (auctioningList === null){
                res.locals.lengthOfAuctionList = 0;
            }else{
                res.locals.lengthOfAuctionList = auctioningList.length;
            }

            const winningList = await productModels.getWinningList(userID);
            res.locals.WinningListByUserID = winningList;
            if (winningList === null){
                res.locals.lengthOfWinningList = 0;
            }else{
                res.locals.lengthOfWinningList = winningList.length;
            }
            const reviewList = await bidderModels.getReviewWithUserID(userID);
            if (reviewList === null){
                res.locals.lengthOfReviewList = 0;
            }else{
                res.locals.lengthOfReviewList = reviewList.length;
            }
        }
        next()
    })


}
