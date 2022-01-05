//admin/categories
import express from 'express';
import productModel from '../../models/product.models.js'

const router = express.Router();

router.get('/', async function(req, res){
    const list = await productModel.findAll()
    console.log(list)
    res.render('vwProducts/index', {
        products: list
    })
})

//admin/categories/add
router.get('/add', function(req, res){
    res.render('vwProducts/add')
})

router.post('/add', async function(req, res){
    await productModel.add(req.body);
    res.render('vwProducts/add')
})

//admin/categories/edit
router.get('/edit', async function(req, res){
    const id = req.query.id || 0;
    const product = await productModel.findById(id)
    console.log(category);
    if(category === null){
        return res.redirect('/admin/products')
    }
    res.render('vwProducts/edit', {
        category
    })
})

//post delete.
router.post('/del', async function(req, res){
    const id = req.body.ProID
    console.log(id)
    const ret = await productModel.deleteCate(id);
    res.redirect('/admin/products')
})

//post patch.
router.post('/patch', async function(req, res){
    const ret = await productModel.patchCate(req.body);
    res.redirect('/admin/products')
})


export default router;