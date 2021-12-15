//admin/categories
import express from 'express';
import categoryModel from '../../models/categories.models.js'

const router = express.Router();

router.get('/', async function(req, res){
    const list = await categoryModel.findAllWithDetails();


    for (const d of res.locals.CategoryL1){ // count tổng số lượng sản phẩm trong 1 CategoryL1.
        d.numberPro = 0;
        for (const c of res.locals.lcCategories){
            if (d.CatID1 === c.CatID1){
                d.numberPro += c.ProductCount;
            }
        }
    }

    res.render('vwCategory/index', {
        categories: list,
        isAdmin:true
    })
})

//admin/categories/add
router.get('/add', function(req, res){
    res.render('vwCategory/add')
})

router.post('/add', async function(req, res){
    await categoryModel.add(req.body);
    res.render('vwCategory/add')
})

//admin/categories/edit
router.get('/edit', async function(req, res){
    const id = req.query.id || 0;
    const category = await categoryModel.findById(id)

    if(category === null){
        return res.redirect('/admin/categories')
    }
    res.render('vwCategory/edit', {
        category
    })
})

//post delete.
router.post('/del', async function(req, res){
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
router.post('/patch', async function(req, res){
    const ret = await categoryModel.patchCate(req.body);
    res.redirect('admin/categories')
})


export default router;