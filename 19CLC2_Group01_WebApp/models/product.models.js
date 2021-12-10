import db from '../utils/db.js'
export default {
    findAll(){
        return db.select().table('Product');
    },

    async findById(id){
        const list =  await db('Product').where('ProID', id).join('CategoryL2', 'Product.CatID2', '=', 'CategoryL2.CatID2').select('Product.*', {CatID1: 'CategoryL2.CatID1'})
        if(list.length === 0){
            return null
        }
        return list[0];
    },

    async findCatIDByProID(proID){
        const list =  await db('Product').where('ProID', proID)
        if(list.length === 0){
            return null
        }
        return list[0].CatID2;
    },

    deleteCate(id){
        console.log(id)
        return db('Product').where('ProID', id).del()
    },

    patchCate(entity){
        const id = entity.CatID;
        delete entity.id;
        return db('Product').where('ProID', id).update(entity)
    },

    findByCatID(CatID){
        return db('Product').where('CatID2', CatID)
    },

    findPageByCatID(CatID, limit, offset){
        return db('Product').where('Product.CatID2', CatID).limit(limit).offset(offset ).join('CategoryL2', 'Product.CatID2', '=', 'CategoryL2.CatID2').select('Product.*', {CatID1: 'CategoryL2.CatID1'})
    },

    async countByCatID(CatID){
        const list = await db('Product').where('CatID2', CatID).count({amount: 'ProID' })
        return list[0].amount
    }

}