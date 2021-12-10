//admin/categories
import express from 'express';
import categoryModel from '../models/categories.models.js'

const router = express.Router();

router.get('/', async function(req, res){
    const list = await categoryModel.findAll()
    res.render('vwCategory/index', {
        categories: list
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
    const id = req.body.CatID

    const ret = await categoryModel.deleteCate(id);
    res.redirect('admin/categories')
})

//post patch.
router.post('/patch', async function(req, res){
    const ret = await categoryModel.patchCate(req.body);
    res.redirect('admin/categories')
})


export default router;