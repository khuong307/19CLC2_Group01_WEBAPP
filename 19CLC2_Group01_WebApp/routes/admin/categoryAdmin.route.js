//admin/categories
import express from 'express';
import categoryModel from '../../models/categories.models.js'

const router = express.Router();

// View category lv1
router.get('/lv1', async function(req, res){
    const list = await categoryModel.findALlCategoryL1();

    for (const d of res.locals.CategoryL1){ // count tổng số lượng sản phẩm trong 1 CategoryL1.
        d.numberPro = 0;
        for (const c of res.locals.lcCategories){
            if (d.CatID1 === c.CatID1){
                d.numberPro += c.ProductCount;
            }
        }
    }

    // Thêm một thuộc tính ProductCount vào CategoryL1 ( Đếm tổng số lượng sản phầm trong 1 CategoryL1)
    list.forEach(element => {
        for(const d of res.locals.CategoryL1){
            if(d.CatID1 === element["CatID1"]){
                element["ProductCount"]=d.numberPro;
            }
        }
    });

    res.render('admin/vwAdminCategory/categoryLV1List', {
        categories: list,
        isAdmin:true
    })
})


//edit category lv1
router.get('/lv1/edit', async function(req, res){
    const id = req.query.id || 0;
    const quantity=req.query.quantity;
    const category = await categoryModel.findByIdLV1(id);


    if(category === null){
        return res.redirect('/admin/categories/lv1')
    }

    // Thêm thuộc tính quantity vào item category LV1
    category["QuantityLV1"]=quantity;
    console.log(category);
    res.render('admin/vwAdminCategory/editCategoryLV1', {
        category,
        isAdmin:true
    })
})


//post update category lv1.
router.post('/lv1/patch', async function(req, res){
    console.log(req.body);
    const ret = await categoryModel.updateCategoryLV1(req.body);
    res.redirect('/admin/categories/lv1')
})

//post delete category lv1.
router.post('/lv1/del', async function(req, res){
    const quantity=req.body.QuantityLV1;
    if(quantity!='0'){
        console.log("You cannot delete this item");
    }
    else{
        const ret = await categoryModel.deleteCategoryLV1(req.body);
        res.redirect('/admin/categories/lv1')
    }
})


// View Category lv2
router.get('/lv2', async function(req, res){
    const list = await categoryModel.findAllWithDetails();


    for (const d of res.locals.CategoryL1){ // count tổng số lượng sản phẩm trong 1 CategoryL1.
        d.numberPro = 0;
        for (const c of res.locals.lcCategories){
            if (d.CatID1 === c.CatID1){
                d.numberPro += c.ProductCount;
            }
        }
    }

    res.render('admin/vwAdminCategory/categoryLV2List', {
        categories: list,
        isAdmin:true
    })
})

//add category lv2
router.get('/lv2/add', function(req, res){
    res.render('admin/vwAdminCategory/addCategoryLV2',{isAdmin:true})
})

router.post('/lv2/add', async function(req, res){
    await categoryModel.add(req.body);
    res.render('admin/vwAdminCategory/addCategoryLV2',{isAdmin:true})
})

//edit category lv2
router.get('/lv2/edit', async function(req, res){
    const id = req.query.id || 0;
    const quantity=req.query.quantity;

    const category = await categoryModel.findById(id)

    if(category === null){
        return res.redirect('/admin/categories/lv2')
    }
    // Thêm thuộc tính Quantity vào item category lv2
    category["QuantityLV2"]=quantity;

    res.render('admin/vwAdminCategory/editCategoryLV2', {
        category,
        isAdmin:true
    })
})

//post delete admin categories lv2
router.post('/lv2/del', async function(req, res){
    const quantity=req.body.QuantityLV2;
    if(quantity!='0'){
        console.log("You cannot delete this item");
    }
    else{
        const ret = await categoryModel.deleteCategoryLV2(req.body);
        res.redirect('/admin/categories/lv2')
    }
})

//post update admin categories lv2.
router.post('/lv2/patch', async function(req, res){
    const ret = await categoryModel.updateCategoryLV2(req.body);
    res.redirect('/admin/categories/lv2')
})


export default router;