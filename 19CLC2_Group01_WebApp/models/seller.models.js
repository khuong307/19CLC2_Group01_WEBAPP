import db from '../utils/db.js'
export default {
    async getProductsBySellerUsername(username, limit, offset){
        const list = await db.select('*').from('Product').join('Account', {'Account.UserID': 'Product.UploadUser'}).orderBy('Product.UploadDate', 'DESC').limit(limit).offset(offset ).where('Account.Username', username)
        if(list.length === 0)
            return null;
        return list
    },

    async countProductByUserID(userID){
        const list = await db('Product').where('UploadUser', userID).count({total: 'ProID' })
        if(list.length === 0)
            return null
        return list[0]
    },

    async getUserIDByUsername(Username){
        const list = await db('Account').where('Username', Username).select('Account.UserID')
        if(list.length === 0){
            return null
        }
        return list[0]
    },

    async getCateL1(){
        return db('CategoryL1')
    },

    async getCateL2(){
        return db('CategoryL2')
    },

    async getCatID1ByCatName1(CatName1){
        const list = await db('CategoryL1').where('CatName1', CatName1).select('CatID1')
        return list[0]
    },

    async getCatID2ByCatName2(CatName2){
        const list = await db('CategoryL2').where('CatName2', CatName2).select('CatID2')
        return list[0]
    },

    async countProID(){
        return db('Product').count({total: 'ProID' })
    },

    async InsertProInfo(entity){
        return db('ProInfoSearch').insert(entity)
    },
    async InsertProduct(entity){
        return db('Product').insert(entity)
    }
}