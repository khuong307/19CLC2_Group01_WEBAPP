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
        isViewEdit:true,
    })
})

//add category lv1
router.get('/lv1/add', function(req, res){
    res.render('admin/vwAdminCategory/addCategoryLV1',{
        isViewEdit:true,
    })
})

// post add category lv1
router.post('/lv1/add',async function(req,res){
    if(req.body.CatName===''){
        console.log("Data is not here");
        res.render('admin/vwAdminCategory/addCategoryLV1', {
            isViewEdit:false,
            isSuccess:false,
        })
    }
    else{
        // Lấy catName ở form nhập
        const CatName1=req.body.CatName;
        // Truy vấn toàn bộ phẩn tử trong Category L1
        const list = await categoryModel.findALlCategoryL1();
        // Lấy ra CatID1 của phần tử cuối trong bảng CategoryL1
        const lastCatID=list[list.length-1].CatID1;
        // Cắt CatID1 của phần tử cuối ra hai phần chuỗi + số
        const firstLetter=lastCatID.slice(0,1);
        const numberID=lastCatID.slice(1);

        // Tạo CatID1 cho phần tử mới
        const newNumberID=parseInt(numberID)+1;
        const CatID1=firstLetter+newNumberID;
        // Tạo phần tử mới
        const entity={};
        entity["CatID1"]=CatID1;
        entity["CatName1"]=CatName1;
        // Insert vào bảng CategoryL1 và redirect về trang trước
        const ret=await categoryModel.insertCategoryL1(entity);
        res.redirect('/admin/categories/lv1/');
    }
})


//post update category lv1.
router.post('/lv1/patch', async function(req, res){
    console.log(req.body);
    let checkValid=isValidCategoryL1(req.body);
    let category = {CatID1:req.body.CatID1,QuantityLV1:req.body.QuantityLV1,CatName1:req.body.CatName1};
    if(checkValid.status==-1){
        return res.render('admin/vwAdminCategory/editCategoryLV1', {
            category,
            isViewEdit:false,
            isSuccess:false,
            isDelete:true,
        })
    }
    else{
        const ret = await categoryModel.updateCategoryLV1(req.body);
        return res.redirect('/admin/categories/lv1/');
    }
})

//post delete category lv1 in a form
router.post('/lv1/del', async function(req, res){
    let category = {CatID1:req.body.CatID1,QuantityLV1:req.body.QuantityLV1,CatName1:req.body.CatName1};
    const quantity=req.body.QuantityLV1;
    if(quantity!='0'){
        console.log("You cannot delete this item");
        res.render('admin/vwAdminCategory/editCategoryLV1', {
            category,
            isViewEdit:false,
            isSuccess:true,
            isDelete:false,
        })
    }
    else{
        // Đầu tiên hủy toàn bộ category ở khóa ngoại ( Category Lv2)
        const refList=await categoryModel.deleteRelateCate1ToCategoryLV2(req.body);
        console.log(refList);
        //  Hủy category lv1
        const ret = await categoryModel.deleteCategoryLV1(req.body);
        res.redirect('/admin/categories/lv1/');
    }
})


// CATEGORY LV2
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
        categories: list
    })
})


//add category lv2
router.get('/lv2/add', function(req, res){
    res.render('admin/vwAdminCategory/addCategoryLV2',{
        isViewEdit:true,
    })
})


// Post category lv2
router.post('/lv2/add', async function(req, res){
    // let isValid=false;
    const CatName2=req.body.CatName2;
    const CatID1=req.body.CatID1;
    const ret=await categoryModel.findByIdLV1(CatID1);

    if(CatName2==='' || CatID1===''){
        console.log("Data is not here");
        return res.render('admin/vwAdminCategory/addCategoryLV2', {
            isViewEdit:false,
            isSuccess:false,
        })
    }
    else if(ret===null)
    {
        console.log("Input wrong CatID1");
        return res.render('admin/vwAdminCategory/addCategoryLV2', {
            isViewEdit:false,
            isSuccess:false,
        })
    }
    else{
        //Lấy danh sách những item trong CategoryL2
        const listL2 = await categoryModel.findAllWithDetails();
        // Lấy ra CatID2 của phần tử cuối trong bảng CategoryL1
        const lastCatID=listL2[listL2.length-1].CatID2;
        // Cắt CatID2 của phần tử cuối ra hai phần chuỗi + số
        const firstLetter=lastCatID.slice(0,1);
        const numberID=lastCatID.slice(1);

        // Tạo CatID2 cho phần tử mới
        const newNumberID=parseInt(numberID)+1;
        const CatID2=firstLetter+newNumberID;
        console.log(CatID2);

        // Tạo phần tử mới
        const entity={};
        entity["CatID2"]=CatID2;
        entity["CatName2"]=CatName2;
        entity["CatID1"]=CatID1;
        // Insert vào bảng CategoryL2 và redirect về trang trước
        const result=await categoryModel.insertCategoryL2(entity);
        res.redirect('/admin/categories/lv2')
    }
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
        isViewEdit:true,
    })
})

//post delete admin categories lv2
router.post('/lv2/del', async function(req, res){
    let category = {CatID2:req.body.CatID2,QuantityLV2:req.body.QuantityLV2,CatName2:req.body.CatName2};
    const quantity=req.body.QuantityLV2;
    if(quantity!='0'){
        console.log("You cannot delete this item");
        return res.render('admin/vwAdminCategory/editCategoryLV2', {
            category,
            isViewEdit:false,
            isSuccess:true,
            isDelete:false,
        })
    }
    else{
        const ret = await categoryModel.deleteCategoryLV2(req.body);
        res.redirect('/admin/categories/lv2')
    }
})

//post update admin categories lv2.
router.post('/lv2/patch', async function(req, res){
    console.log(req.body);
    let checkValid=isValidCategoryL2(req.body);
    let category = {CatID2:req.body.CatID2,QuantityLV2:req.body.QuantityLV2,CatName2:req.body.CatName2};
    if(checkValid.status==-1){
        return res.render('admin/vwAdminCategory/editCategoryLV2', {
            category,
            isViewEdit:false,
            isSuccess:false,
            isDelete:true,
        })
    }
    else{
        const ret = await categoryModel.updateCategoryLV2(req.body);
        return res.redirect('/admin/categories/lv2/');
    }
})


function isValidCategoryL1(obj){
    if(obj.CatName1==''){
        return {status:-1,msg:"CatName1 is missing"};
    }
    return {status:1,msg:"Successfully"};
}

function isValidCategoryL2(obj){
    if(obj.CatName2==''){
        return {status:-1,msg:"CatName1 is missing"};
    }
    return {status:1,msg:"Successfully"};
}

export default router;