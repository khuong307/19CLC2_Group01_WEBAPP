//middle-ware: sẽ được khởi động chạy trước khi vào file hbs,  để lên trước các app.get
import categoryModel from "../models/categories.models.js";
import productModels from "../models/product.models.js";


export default function(app){
    //khuong.
    app.use(async function(req, res, next){
        if(typeof (req.session.auth) === 'undefined'){
            req.session.auth = false;
        }
        if(typeof (req.session.authUser) === 'undefined'){
            req.session.authUser = false;
        }

        res.locals.auth = req.session.auth
        res.locals.authUser = req.session.authUser

        if(res.locals.authUser != false){
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
        if(res.locals.authUser != false){
            //console.log(res.locals.authUser)
            const userID = res.locals.authUser.UserID
            const list = await productModels.getWatchListByUserID(userID)
            res.locals.WatchListByUSerID = list
            res.locals.lengthOfWatchList = list.length
        }
        // Khang
        next()
    })


}
