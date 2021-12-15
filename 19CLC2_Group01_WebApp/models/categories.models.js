import db from '../utils/db.js'
export default {
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

    // async findAllWithCategoryL2(){
    //     const sql = `select p.*
    //                  from CategoryL1 c left join CategoryL2 p on c.CatID1 = p.CatID1
    //                  group by p.CatID2, p.CatName2`
    //     const raw = await db.raw(sql)
    //     return raw[0]
    // }

    async findByIdLV1(id){
        const list =  await db('CategoryL1').where('CatID1', id)
        if(list.length === 0){
            return null
        }
        return list[0];
    },

    async findALlCategoryL1(){
        return db.select().table('CategoryL1');
    }
}