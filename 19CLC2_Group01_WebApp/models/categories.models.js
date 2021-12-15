import db from '../utils/db.js'
export default {
<<<<<<< Updated upstream
=======
    // Minh
>>>>>>> Stashed changes
    async findByIdLV1(id){
        const list =  await db('CategoryL1').where('CatID1', id)
        if(list.length === 0){
            return null
        }
        return list[0];
    },

<<<<<<< Updated upstream
=======
    // Minh
>>>>>>> Stashed changes
    async findALlCategoryL1(){
        return db.select().table('CategoryL1');
    },

<<<<<<< Updated upstream
    updateCategoryLV1(entity){
        const id = entity.CatID1;
        delete entity.id;
        return db('CategoryL1').where('CatID1', id).update(entity)
    },

=======
    // Minh
    updateCategoryLV1(entity){
        const id = entity.CatID1;
        delete entity.QuantityLV1;
        return db('CategoryL1').where('CatID1', id).update(entity)
    },

    // Minh
>>>>>>> Stashed changes
    deleteCategoryLV1(entity){
        const id=entity.CatID1;
        return db('CategoryL1').where('CatID1', id).del()
    },

<<<<<<< Updated upstream
=======
    // Minh
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    updateCategoryLV2(entity){
        const id = entity.CatID2;
        delete entity.id;
        return db('CategoryL2').where('CatID2', id).update(entity)
    },

    deleteCategoryLV2(entity){
        const id=entity.CatID2;
        return db('CategoryL2').where('CatID2', id).del()
=======
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
>>>>>>> Stashed changes
    },
}