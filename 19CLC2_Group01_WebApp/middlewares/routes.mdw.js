import productUserRoute from "../routes/product-user.route.js";
import accountRoute from "../routes/account.route.js";
import productModels from "../models/product.models.js";
import sellerRoute from "../routes/seller.route.js";
import bidderRoute from "../routes/bidder.route.js";
//[ADD][MINH][15/12/2021]
import indexAdminRoute from "../routes/admin/indexAdmin.route.js";
import categoryAdminRoute from "../routes/admin/categoryAdmin.route.js";
import productAdminRoute from "../routes/admin/productAdmin.route.js";
import userAdminRoute from "../routes/admin/userAdmin.route.js";
//[END]

import {dirname} from "path";
import {fileURLToPath} from "url";
import productModel from "../models/product.models.js";
const __dirname = dirname(fileURLToPath(import.meta.url)) //lấy đường dẫn chi tiết.

export default function(app){
    app.get('/', async function(req, res){
        req.session.retURL = req.originalUrl
        const top5Price = await productModels.getTop5ByPrice();

        for (const c of top5Price){
            const catID1 = await productModel.getCatID1FromCatID2(c.CatID2)
            c.CatID1 = catID1.CatID1
        }

        const top5Date = await productModels.getTop5byClose();
        for (const c of top5Date){
            const catID1 = await productModel.getCatID1FromCatID2(c.CatID2)
            c.CatID1 = catID1.CatID1
        }

        const top5Auction = await productModel.getTop5ByAuction()
        for (const c of top5Auction){
            const catID1 = await productModel.getCatID1FromCatID2(c.CatID2)
            c.CatID1 = catID1.CatID1
        }

        //check which product selected in watch list
        if (res.locals.WatchListByUSerID != null){
            for(const c of top5Price){
                for (const d of res.locals.WatchListByUSerID){
                    if (c.ProID === d.ProID){
                        c.isWatchList = 1;
                    }
                }
            }

            for(const c of top5Date){
                for (const d of res.locals.WatchListByUSerID){
                    if (c.ProID === d.ProID){
                        c.isWatchList = 1;
                    }
                }
            }

            for(const c of top5Auction){
                for (const d of res.locals.WatchListByUSerID){
                    if (c.ProID === d.ProID){
                        c.isWatchList = 1;
                    }
                }
            }
        }



        const isLogin = req.session.auth || false
        res.render('home',{
            top5Date,
            top5Price,
            top5Auction,
            isLogin
        });
    });

    //about.hbs
    app.get('/about', function(req, res){
        req.session.retURL = req.originalUrl
        res.render('about');
    });

    //bs4.
    app.get('/bs4', function(req, res){
        req.session.retURL = req.originalUrl
        res.sendFile(__dirname + '/bs4.html')
    })

    //admin/categories
    //admin/categories
    //[ADD][MINH][15/12/2021]
    app.use('/admin/',indexAdminRoute)
    // admin/products
    app.use('/admin/categories', categoryAdminRoute)
    //admin/products
    app.use('/admin/products', productAdminRoute)
    //user
    app.use('/admin/user',userAdminRoute);
    //[END]

    //product under user view.
    app.use('/products', productUserRoute)
    //account related file.
    app.use('/account', accountRoute)
    //seller
    app.use('/seller', sellerRoute)
    //Khang: route bidder
    app.use('/bidder', bidderRoute)
}