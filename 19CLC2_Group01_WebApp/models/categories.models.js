import db from '../utils/db.js'
export default {
    // CATEGORY LV1
    // Minh
    async findByIdLV1(id){
        const list =  await db('CategoryL1').where('CatID1', id)
        if(list.length === 0){
            return null
        }
        return list[0];
    },

    // Minh
    async findALlCategoryL1(){
        return db.select().table('CategoryL1');
    },

    // Minh
    insertCategoryL1(entity){
        return db('CategoryL1').insert(entity);
    },

    // Minh
    updateCategoryLV1(entity){
        const id = entity.CatID1;
        delete entity.QuantityLV1;
        return db('CategoryL1').where('CatID1', id).update(entity)
    },

    // Minh
    deleteCategoryLV1(entity){
        const id=entity.CatID1;
        return db('CategoryL1').where('CatID1', id).del()
    },

    // CATEGORY LV2

    // Minh
    findAll(){
        return db.select().table('CategoryL2');
    },

    // Minh
    async findById(id){
        const list =  await db('CategoryL2').where('CatID2', id)
        if(list.length === 0){
            return null
        }
        return list[0];
    },

    // Minh
    async findAllWithDetails(){
        const sql = `select c.*, count(p.ProID) as ProductCount
                     from CategoryL2 c
                              left join Product p on c.CatID2 = p.CatID2
                     group by c.CatID2, c.CatName2`;
        const raw = await db.raw(sql);
        return raw[0];
    },

    // Minh
    insertCategoryL2(entity){
        return db('CategoryL2').insert(entity);
    },

    // Minh
    updateCategoryLV2(entity){
        const id = entity.CatID2;
        delete entity.QuantityLV2;
        return db('CategoryL2').where('CatID2', id).update(entity)
    },

    // Minh
    deleteCategoryLV2(entity){
        const id=entity.CatID2;
        return db('CategoryL2').where('CatID2', id).del()
    },

    // Minh
    deleteRelateCate1ToCategoryLV2(entity){
        const id=entity.CatID1;
        return db('CategoryL2').where('CatID1', id).del()
    },

    // Minh
    delCategoryL1ToL2ById(id){
        return db('CategoryL2').where('CatID1', id).del()
    },

    // Minh
    delCategoryL1ById(id){
        return db('CategoryL1').where('CatID1', id).del()
    },

    // Minh
    deleteCategoryL2ByID(id){
        return db('CategoryL2').where('CatID2', id).del()
    },
}