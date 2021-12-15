import db from '../utils/db.js'
export default {
    async findByIdLV1(id){
        const list =  await db('CategoryL1').where('CatID1', id)
        if(list.length === 0){
            return null
        }
        return list[0];
    },

    async findALlCategoryL1(){
        return db.select().table('CategoryL1');
    },

    updateCategoryLV1(entity){
        const id = entity.CatID1;
        delete entity.id;
        return db('CategoryL1').where('CatID1', id).update(entity)
    },

    deleteCategoryLV1(entity){
        const id=entity.CatID1;
        return db('CategoryL1').where('CatID1', id).del()
    },

    findAll(){
        return db.select().table('CategoryL2');
    },

    async findById(id){
        const list =  await db('CategoryL2').where('CatID2', id)
        if(list.length === 0){
            return null
        }
        return list[0];
    },

    async findAllWithDetails(){
        const sql = `select c.*, count(p.ProID) as ProductCount
                     from CategoryL2 c
                              left join Product p on c.CatID2 = p.CatID2
                     group by c.CatID2, c.CatName2`;
        const raw = await db.raw(sql);
        return raw[0];
    },

    updateCategoryLV2(entity){
        const id = entity.CatID2;
        delete entity.id;
        return db('CategoryL2').where('CatID2', id).update(entity)
    },

    deleteCategoryLV2(entity){
        const id=entity.CatID2;
        return db('CategoryL2').where('CatID2', id).del()
    },
}