//admin/categories
import express from 'express';
import productModel from '../models/product.models.js'

const router = express.Router();

router.get('/byCat/:id', async function(req, res){
    const catID2 = req.params.id || 0

    for (const c of res.locals.lcCategories){ // nhấn vào thì hiện xanh.
        if(c.CatID2 === catID2){
            c.isActive = 1;
            console.log(c.CatID2, catID2)
            break
        }
    }

    const limit = 3
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const total = await productModel.countByCatID(catID2)
    let nPages = Math.floor(total/limit)
    let pageNumbers = []
    if(total % limit > 0){
        nPages++
    }

    for (let i = 1; i <= nPages; i++){
        pageNumbers.push({
            value: i,
            isCurrentPage: +page === i,
        })
    }

    const list = await productModel.findPageByCatID(catID2, limit, offset)
    res.render('vwProducts/byCat', {
        products: list,
        empty: list.length === 0,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages
    })
})

router.get('/detail/:id', async function(req, res){
    //const catID = req.query.id || 0
    const proID = req.params.id || 0
    var CatID = await productModel.findCatIDByProID(proID)
    for (const c of res.locals.lcCategories){ // nhấn vào thì hiện xanh.
        if(c.CatID2 === CatID){
            c.isActive = 1;
            break
        }
    }

    const product = await productModel.findById(proID)
    if(product===null){
        return res.redirect('/')
    }
    res.render('vwProducts/detail', {
        product,
        empty: product.length === 0
    })
})

export default router;