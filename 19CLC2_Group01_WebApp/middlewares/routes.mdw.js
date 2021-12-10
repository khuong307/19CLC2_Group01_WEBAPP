import categoryRoute from "../routes/category.route.js";
import productRoute from "../routes/product.route.js";
import productUserRoute from "../routes/product-user.route.js";
import accountRoute from "../routes/account.route.js";

import {dirname} from "path";
import {fileURLToPath} from "url";
const __dirname = dirname(fileURLToPath(import.meta.url)) //lấy đường dẫn chi tiết.

export default function(app){
    app.get('/', function(req, res){
        res.render('home');
    });

    //about.hbs
    app.get('/about', function(req, res){
        res.render('about');
    });

    //bs4.
    app.get('/bs4', function(req, res){
        res.sendFile(__dirname + '/bs4.html')
    })

    //admin/categories
    app.use('/admin/categories', categoryRoute)
    //admin/products
    app.use('/admin/products', productRoute)
    //product under user view.
    app.use('/products', productUserRoute)
    //account related file.
    app.use('/account', accountRoute)
}