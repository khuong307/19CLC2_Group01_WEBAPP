//middle-ware: sẽ được khởi động chạy trước khi vào file hbs,  để lên trước các app.get
import categoryModel from "../models/categories.models.js";


export default function(app){
    app.use(async function(req, res, next){
        const lcCategories = await categoryModel.findAllWithDetails()
        res.locals.lcCategories = lcCategories //áp dụng biến local dùng được mọi nơi.


        const CategoryL1 = await categoryModel.findALlCategoryL1()
        res.locals.CategoryL1 = CategoryL1;
        next()
    })
}
