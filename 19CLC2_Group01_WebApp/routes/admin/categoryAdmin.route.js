//admin/categories
import express from 'express';
import categoryModel from '../../models/categories.models.js'

const router = express.Router();

router.get('/lv1', async function(req, res){
    const list = await categoryModel.findALlCategoryL1();
    console.log(list[0]);

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


//admin/categories/edit ( level 1)
router.get('/lv1/edit', async function(req, res){
    const id = req.query.id || 0;
    const category = await categoryModel.findByIdLV1(id);

    if(category === null){
        return res.redirect('/admin/categories/lv1')
    }
    res.render('admin/vwAdminCategory/editCategoryLV1', {
        category,
        isAdmin:true
    })
})



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

//admin/categories/lv2/add
router.get('/lv2/add', function(req, res){
    res.render('admin/vwAdminCategory/addCategoryLV2',{isAdmin:true})
})

router.post('/lv2/add', async function(req, res){
    await categoryModel.add(req.body);
    res.render('admin/vwAdminCategory/addCategoryLV2',{isAdmin:true})
})

//admin/categories/edit ( Lv2)
router.get('/lv2/edit', async function(req, res){
    const id = req.query.id || 0;
    const category = await categoryModel.findById(id)

    if(category === null){
        return res.redirect('/admin/categories/lv2')
    }
    res.render('admin/vwAdminCategory/editCategoryLV2', {
        category,
        isAdmin:true
    })
})

//post delete.
router.post('/lv2/del', async function(req, res){
    const id = req.params.id;
    const productCount=req.params.quantity;
    console.log(productCount);
    if(productCount!=0){
        alert("You cannot delete this item");
    }
    //const ret = await categoryModel.deleteCate(id);
    res.redirect('admin/categories')
})

//post patch.
router.post('/lv2/patch', async function(req, res){
    const ret = await categoryModel.patchCate(req.body);
    res.redirect('admin/categories')
})


export default router;