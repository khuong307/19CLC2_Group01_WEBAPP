import db from '../utils/db.js'
export default {
    async getProductsBySellerUsername(username, limit, offset){
        const list = await db.select('*').from('Product').join('Account', {'Account.UserID': 'Product.UploadUser'}).limit(limit).offset(offset ).where('Account.Username', username)
        if(list.length === 0)
            return null;
        return list
    },

    async getUserIDByUsername(Username){
        const list = await db('Account').where('Username', Username).select('Account.UserID')
        if(list.length === 0){
            return null
        }
        return list[0]
    }
}