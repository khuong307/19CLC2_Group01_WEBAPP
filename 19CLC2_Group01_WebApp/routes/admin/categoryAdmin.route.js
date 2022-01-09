//admin/categories
import express from 'express';
import categoryModel from '../../models/categories.models.js';
import auth from "../../middlewares/auth.mdw.js";

const router = express.Router();

// View category lv1
router.get('/lv1',auth, async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    // Paging
    const limit = 8
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const total = await categoryModel.countCateL1()
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

    const list = await categoryModel.findPageByCateL1(limit, offset)

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
        isAdmin:true,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
    })
})

// Xem danh mục cấp 2 dựa vào Id danh mục cấp 1
router.get('/lv1/detailL2',auth, async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;


    // Lấy id từ query string
    const id = req.query.id || 0;
    const list = await categoryModel.findCateL2ByIdCateL1(id);

    res.render('admin/vwAdminCategory/categoryLV2List', {
        categories: list
    })
})

//edit category lv1
router.get('/lv1/edit',auth,async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const id = req.query.id || 0;
    let quantity=req.query.quantity;
    const category = await categoryModel.findByIdLV1(id);


    if(category === null){
        return res.redirect('/admin/categories/lv1')
    }

    // Thêm thuộc tính quantity vào item category LV1
    if(!quantity){
        quantity=0;
    }
    category["QuantityLV1"]=quantity;
    res.render('admin/vwAdminCategory/editCategoryLV1', {
        category,
        isViewEdit:true,
    })
})

//add category lv1
router.get('/lv1/add', auth,function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;
    res.render('admin/vwAdminCategory/addCategoryLV1',{
        isViewEdit:true,
    })
})

// post add category lv1
router.post('/lv1/add',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    // Lấy catName ở form nhập
    const CatName1=req.body.CatName;
    // Truy vấn toàn bộ phẩn tử trong Category L1
    const list = await categoryModel.findALlCategoryL1();
    // Kiểm tra CatName1 có tồn tại sẵn trong Category L1 chưa
    let isExist=checkExistCateL1(list,CatName1);

    if(req.body.CatName===''){
        return res.render('admin/vwAdminCategory/addCategoryLV1', {
            isViewEdit:false,
            isSuccess:false,
            msg:"Bạn nên điền dầy đủ thông tin vào form"
        })
    }
    else if(isExist.status===1){
        return res.render('admin/vwAdminCategory/addCategoryLV1', {
            isViewEdit:false,
            isSuccess:false,
            msg:isExist.msg,
        })
    }
    else{
        // // Trường hợp chưa có tồn tại CatName1 mới cho tạo
        // // Lấy ra CatID1 của phần tử cuối trong bảng CategoryL1
        // const lastCatID=list[list.length-1].CatID1;
        // // Cắt CatID1 của phần tử cuối ra hai phần chuỗi + số
        // const firstLetter=lastCatID.slice(0,1);
        // const numberID=lastCatID.slice(1);
        //
        // // Tạo CatID1 cho phần tử mới
        // const newNumberID=parseInt(numberID)+1;
        // const CatID1=firstLetter+newNumberID;
        const ans = await categoryModel.findMaxCatID1()
        const stt = parseInt(ans.CatID1.slice(1,4)) + 1
        var CatID1 = "L" + stt

        // Tạo phần tử mới
        const entity={};
        entity["CatID1"]=CatID1;
        entity["CatName1"]=CatName1;
        // Insert vào bảng CategoryL1 và redirect về trang trước
        const ret=await categoryModel.insertCategoryL1(entity);
        res.redirect('/admin/categories/lv1');
    }
})


//post update category lv1.
router.post('/lv1/patch', auth,async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    // Kiểm tra phần form nhập vào CatName1 liệu có bỏ trống
    let checkValid=isValidCategoryL1(req.body);
    // Tạo category để khi có lỗi render lại đúng những thông tin cần thiết
    let category = {CatID1:req.body.CatID1,QuantityLV1:req.body.QuantityLV1,CatName1:req.body.CatName1};

    // Lấy catName ở form nhập
    const CatName1=req.body.CatName1;
    // Truy vấn toàn bộ phẩn tử trong Category L1
    const list = await categoryModel.findALlCategoryL1();
    // Kiểm tra CatName1 có tồn tại sẵn trong Category L1 chưa
    let isExist=checkExistCateL1(list,CatName1);

    if(checkValid.status==-1){
        return res.render('admin/vwAdminCategory/editCategoryLV1', {
            category,
            isViewEdit:false,
            isSuccess:false,
            isDelete:true,
            msg:checkValid.msg,
        })
    }
    else if(isExist.status===1){
        return res.render('admin/vwAdminCategory/editCategoryLV1', {
            category,
            isViewEdit:false,
            isSuccess:false,
            isDelete:true,
            msg:isExist.msg,
        })
    }
    else{
        const ret = await categoryModel.updateCategoryLV1(req.body);
        return res.redirect('/admin/categories/lv1');
    }
})

//post delete category lv1 in a form
router.post('/lv1/del', auth,async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    // Tạo category để khi có lỗi render lại đúng những thông tin cần thiết
    let category = {CatID1:req.body.CatID1,QuantityLV1:req.body.QuantityLV1,CatName1:req.body.CatName1};
    const quantity=req.body.QuantityLV1;
    // Nếu số lượng lớn hơn 0 thì báo lỗi
    if(quantity!='0'){
        res.render('admin/vwAdminCategory/editCategoryLV1', {
            category,
            isViewEdit:false,
            isSuccess:false,
            msg:"Bạn không thể xóa danh mục với số lượng lớn hơn 0"
        })
    }
    else{
        // Đầu tiên hủy toàn bộ category ở khóa ngoại ( Category Lv2)
        const refList=await categoryModel.deleteRelateCate1ToCategoryLV2(req.body);
        console.log(refList);
        //  Hủy category lv1
        const ret = await categoryModel.deleteCategoryLV1(req.body);
        res.redirect('/admin/categories/lv1');
    }
})


// post delete category l1 in a table
router.post('/lv1/delrow',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    let CatID1=req.query.id;
    // Đầu tiên hủy toàn bộ category ở khóa ngoại ( Category Lv2)
    const refList=await categoryModel.delCategoryL1ToL2ById(CatID1);
    console.log(refList);
    //  Hủy category lv1
    const ret = await categoryModel.delCategoryL1ById(CatID1);
    res.json({
        msg:"Xóa thành công",
        status:1,
    });
})


// CATEGORY LV2
// View Category lv2
router.get('/lv2',auth, async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    // Paging
    const limit = 8
    const page = req.query.page || 1 //Paging
    const offset = (page - 1) *limit

    const total = await categoryModel.countCateL2()
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

    const list = await categoryModel.findPageByCateL2(limit, offset)

    //const list = await categoryModel.findDetailCateL2();

    res.render('admin/vwAdminCategory/categoryLV2List', {
        categories: list,
        pageNumbers,
        currentPageIndex: page,
        isFirstPage: +page != 1,
        isLastPage: +page != nPages,
    })
})


//add category lv2
router.get('/lv2/add',auth,async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const list=await categoryModel.findALlCategoryL1();
    res.render('admin/vwAdminCategory/addCategoryLV2',{
        isViewEdit:true,
        categories:list,
    })
})


// Post category lv2
router.post('/lv2/add', auth,async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    const CatName2=req.body.CatName2;
    const CatID1=req.body.CatID1;
    // Tạo danh sách các danh mục cấp 1 để khi render lại chính trang đó tồn tại
    const list=await categoryModel.findALlCategoryL1();
    // Tìm toàn bộ tên danh mục cấp 2
    const list2=await categoryModel.findAll();
    // Kiểm tra danh mục cấp 2 vừa tạo có trùng tên
    let isExist=checkExistCateL2(list2,CatName2);

    if(CatName2==='' || CatID1===''){
        return res.render('admin/vwAdminCategory/addCategoryLV2', {
            isViewEdit:false,
            isSuccess:false,
            categories:list,
            msg:"Bạn phải điền đầy đủ thông tin bên dưới",
        })
    }
    else if(isExist.status===1){
        return res.render('admin/vwAdminCategory/addCategoryLV2', {
            isViewEdit:false,
            isSuccess:false,
            categories:list,
            msg:isExist.msg,
        })
    }
    else{
        // //Lấy danh sách những item trong CategoryL2
        // const listL2 = await categoryModel.findAllWithDetails();
        // // Lấy ra CatID2 của phần tử cuối trong bảng CategoryL1
        // const lastCatID=listL2[listL2.length-1].CatID2;
        // console.log(lastCatID)
        // // Cắt CatID2 của phần tử cuối ra hai phần chuỗi + số
        // const firstLetter=lastCatID.slice(0,1);
        // const numberID=lastCatID.slice(1);
        //
        // // Tạo CatID2 cho phần tử mới
        // const newNumberID=parseInt(numberID)+1;
        // const CatID2=firstLetter+newNumberID;

        const ans = await categoryModel.findMaxCatID2()
        const stt = parseInt(ans.CatID2.slice(1,4)) + 1
        var CatID2 = "L" + stt

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
router.get('/lv2/edit', auth,async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

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
router.post('/lv2/del', auth,async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    // Tạo category để khi lỗi render ra lại đúng form đó
    let category = {CatID2:req.body.CatID2,QuantityLV2:req.body.QuantityLV2,CatName2:req.body.CatName2};
    const quantity=req.body.QuantityLV2;
    if(quantity!='0'){
        return res.render('admin/vwAdminCategory/editCategoryLV2', {
            category,
            isViewEdit:false,
            isSuccess:false,
            msg:"Bạn không thể xóa danh mục cấp 2 với số lượng lớn hơn 0",
        })
    }
    else{
        const ret = await categoryModel.deleteCategoryLV2(req.body);
        res.redirect('/admin/categories/lv2')
    }
})


// post delete category l1 in a table
router.post('/lv2/delrow',auth,async function(req,res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    let CatID2=req.query.id;
    const ret = await categoryModel.deleteCategoryL2ByID(CatID2);
    res.json({
        msg:"Xóa thành công",
        status:1,
    });
})

//post update admin categories lv2.
router.post('/lv2/patch',auth, async function(req, res){
    if(res.locals.authUser != null){
        if (res.locals.authUser.Type != 3){
            res.redirect('/')
        }
    }
    req.session.retURL=req.originalUrl;

    // Kiểm tra liệu form có để trống tên
    let checkValid=isValidCategoryL2(req.body);
    // Tạo category để khi lỗi render ra lại đúng form đó
    let category = {CatID2:req.body.CatID2,QuantityLV2:req.body.QuantityLV2,CatName2:req.body.CatName2};
    // Tìm toàn bộ tên danh mục cấp 2
    const list2=await categoryModel.findAll();
    // Kiểm tra danh mục cấp 2 vừa tạo có trùng tên
    let isExist=checkExistCateL2(list2,req.body.CatName2);

    if(checkValid.status==-1){
        return res.render('admin/vwAdminCategory/editCategoryLV2', {
            category,
            isViewEdit:false,
            isSuccess:false,
            msg:checkValid.msg,
        })
    }
    else if(isExist.status===1){
        return res.render('admin/vwAdminCategory/editCategoryLV2', {
            category,
            isViewEdit:false,
            isSuccess:false,
            msg:isExist.msg,
        })
    }
    else{
        const ret = await categoryModel.updateCategoryLV2(req.body);
        return res.redirect('/admin/categories/lv2');
    }
})

// Kiểm tra tên danh mục cấp 1 bỏ trống hay không
function isValidCategoryL1(obj){
    if(obj.CatName1==''){
        return {status:-1,msg:"Tên danh mục cấp 1 chưa được điền"};
    }
    return {status:1,msg:"Thành công"};
}


// Kiểm tra tên danh mục cấp 2 bỏ trống hay không
function isValidCategoryL2(obj){
    if(obj.CatName2==''){
        return {status:-1,msg:"Tên danh mục cấp 2 chưa được điền"};
    }
    return {status:1,msg:"Thành công"};
}


// Kiểm tra tên danh mục tạo mới có trùng với danh mục cấp 1 đã có
function checkExistCateL1(list,CatName){
    for(let i=0;i<list.length;i++){
        if(list[i].CatName1===CatName){
            return {status:1,msg:"Danh mục bạn tạo đã có sẵn, vui lòng tạo lại tên khác"};
        }
    }
    return {status: 0,msg:"Tạo thành công"};
}

// Kiểm tra tên danh mục tạo mới có trùng với danh mục cấp 2 đã có
function checkExistCateL2(list,CatName){
    for(let i=0;i<list.length;i++){
        if(list[i].CatName2===CatName){
            return {status:1,msg:"Danh mục bạn tạo đã có sẵn, vui lòng tạo lại tên khác"};
        }
    }
    return {status: 0,msg:"Tạo thành công"};
}


export default router;