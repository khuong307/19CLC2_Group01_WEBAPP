//admin/
import express from 'express';
import productModel from '../../models/product.models.js'

const router = express.Router();

router.get('/', async function(req, res){
    // const list = await productModel.findAll()
    // console.log(list)
    res.render('admin/home',{isAdmin:true})
})

export default router;