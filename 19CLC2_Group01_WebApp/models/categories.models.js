import db from '../utils/db.js'
import moment from "moment";
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

    // async findAllWithCategoryL2(){
    //     const sql = `select p.*
    //                  from CategoryL1 c left join CategoryL2 p on c.CatID1 = p.CatID1
    //                  group by p.CatID2, p.CatName2`
    //     const raw = await db.raw(sql)
    //     return raw[0]
    // }

    async findALlCategoryL1(){
        return db.select().table('CategoryL1');
    }

}