import db from '../utils/db.js'
import moment from "moment";
export default {
    findAll(){
        return db.select().table('CategoryL2');
    },

    async findById(id){
        const list =  await db('CategoryL2').where('CatID2', id).groupBy('CatName2')
        if(list.length === 0){
            return null
        }
        return list[0];
    },

    async findAllWithDetails(){
        const now = moment(new Date()).utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss')
        const sql = `select c.*, count(p.ProID) as ProductCount
                     from CategoryL2 c
                              left join Product p on c.CatID2 = p.CatID2
                     where
                         p.EndDate > '${now}' and p.Winner IS NULL
                     group by c.CatID2, c.CatName2`;
        const raw = await db.raw(sql);
        return raw[0];
    },


    // CATEGORY LV1
    // Minh
    async findByIdLV1(id) {
        const list = await db('CategoryL1').where('CatID1', id)
        if (list.length === 0) {
            return null
        }
        return list[0];
    },

    // Minh
    async findALlCategoryL1() {
        return db.select().table('CategoryL1');
    },

    // Minh
    insertCategoryL1(entity) {
        return db('CategoryL1').insert(entity);
    },

    // Minh
    updateCategoryLV1(entity) {
        const id = entity.CatID1;
        delete entity.QuantityLV1;
        return db('CategoryL1').where('CatID1', id).update(entity)
    },

    // Minh
    deleteCategoryLV1(entity) {
        const id = entity.CatID1;
        return db('CategoryL1').where('CatID1', id).del()
    },

    // CATEGORY LV2

    // Minh
    // Tìm thông tin của category L2 + tên catname1
    async findDetailCateL2() {
        const sql = 'select c.*,c1.CatName1, count(p.ProID) as ProductCount from CategoryL2 c left join CategoryL1 c1 on c.CatID1 = c1.CatID1 left join Product p on c.CatID2 = p.CatID2 group by c.CatID2, c.CatName2';
        const raw=await db.raw(sql);
        return raw[0];
    },

    // Tìm thông tin của category L2 + tên catname1 dựa trên id Category L1
    async findCateL2ByIdCateL1(CatID1) {
        const sql = `select c.*,c1.CatName1, count(p.ProID) as ProductCount from CategoryL2 c left join CategoryL1 c1 on c.CatID1 = c1.CatID1 left join Product p on c.CatID2 = p.CatID2 where c.CatID1='`+CatID1+ `' group by c.CatID2, c.CatName2`;
        const raw=await db.raw(sql);
        return raw[0];
    },

    // Minh
    insertCategoryL2(entity) {
        return db('CategoryL2').insert(entity);
    },

    // Minh
    updateCategoryLV2(entity) {
        const id = entity.CatID2;
        delete entity.QuantityLV2;
        return db('CategoryL2').where('CatID2', id).update(entity)
    },

    // Minh
    deleteCategoryLV2(entity) {
        const id = entity.CatID2;
        return db('CategoryL2').where('CatID2', id).del()
    },

    // Minh
    deleteRelateCate1ToCategoryLV2(entity) {
        const id = entity.CatID1;
        return db('CategoryL2').where('CatID1', id).del()
    },

    // Minh
    delCategoryL1ToL2ById(id) {
        return db('CategoryL2').where('CatID1', id).del()
    },

    // Minh
    delCategoryL1ById(id) {
        return db('CategoryL1').where('CatID1', id).del()
    },

    // Minh
    deleteCategoryL2ByID(id) {
        return db('CategoryL2').where('CatID2', id).del()
    },

    // Minh:Đếm số lượng CateL2
    async countCateL2(){
        const list = await db('CategoryL2').count({amount: 'CatID2' })
        return list[0].amount
    },

    // Minh: Tìm CateL2 chia theo Page
    async findPageByCateL2(limit, offset){
        const sql = 'select c.*,c1.CatName1, count(p.ProID) as ProductCount from CategoryL2 c left join CategoryL1 c1 on c.CatID1 = c1.CatID1 left join Product p on c.CatID2 = p.CatID2 group by c.CatID2, c.CatName2 limit '+limit+' offset '+offset;
        const raw=await db.raw(sql);
        return raw[0];
    },

    // Minh:Đếm số lượng CateL1
    async countCateL1(){
        const list = await db('CategoryL1').count({amount: 'CatID1' })
        return list[0].amount
    },

    // Minh: Tìm CateL1 theo page
    findPageByCateL1(limit, offset) {
        return db.select().table('CategoryL1').limit(limit).offset(offset);
    },

    // Khuong: Max CatID2
    async findMaxCatID2() {
        const ans = await db.select().table('CategoryL2').orderBy('CatID2', 'DESC');
        return ans[0]
    },

    // Khuong: Max CatID1
    async findMaxCatID1() {
        const ans = await db.select().table('CategoryL1').orderBy('CatID1', 'DESC');
        return ans[0]
    },

}