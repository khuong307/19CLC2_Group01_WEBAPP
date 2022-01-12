import db from '../utils/db.js'
export default {
    async getProductsBySellerUsername(username, limit, offset){
        const list = await db.select('*').from('Product').join('Account', {'Account.UserID': 'Product.UploadUser'}).orderBy('Product.UploadDate', 'DESC').limit(limit).offset(offset ).where('Account.Username', username)
        if(list.length === 0)
            return null;
        return list
    },

    async getOutDateProductsBySellerUsername(username, limit, offset){
        const list = await db.select('*').from('Product').where('Product.EndDate', '<', new Date()).whereNull('Winner').join('Account', {'Account.UserID': 'Product.UploadUser'}).orderBy('Product.UploadDate', 'DESC').limit(limit).offset(offset ).where('Account.Username', username)
        if(list.length === 0)
            return null;
        return list
    },

    async getSoldProductsBySellerUsername(username, limit, offset){
        const list = await db.select('*').from('Product').whereNotNull('Winner').join('Account', {'Account.UserID': 'Product.UploadUser'}).orderBy('Product.UploadDate', 'DESC').limit(limit).offset(offset ).where('Account.Username', username)
        if(list.length === 0)
            return null;
        return list
    },

    async countProductByUserID(userID){
        const list = await db('Product').where('UploadUser', userID).andWhere('Product.EndDate', '>', new Date()).whereNull('Winner').count({total: 'ProID' })
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
        return db('Product').orderBy('ProID', 'DESC')
    },

    async InsertProInfo(entity){
        return db('ProInfoSearch').insert(entity)
    },
    async InsertProduct(entity){
        return db('Product').insert(entity)
    },

    //outdate
    async countOutdateProductByUserID(userID){
        const list = await db('Product').where('UploadUser', userID).andWhere('Product.EndDate', '<', new Date()).whereNull('Winner').count({total: 'ProID' })
        if(list.length === 0)
            return null
        return list[0]
    },

    //sold
    async countSoldProductByUserID(userID){
        const list = await db('Product').where('UploadUser', userID).whereNotNull('Winner').count({total: 'ProID' })
        if(list.length === 0)
            return null
        return list[0]
    },

    async addNewReviewBySeller(newReview){
        return db('Review').insert(newReview)
    },

    //
    async checkReview(seller, bidder, pro){
        const ans = await db('Review').where('SenderID', seller).andWhere('ReceiverID', bidder).andWhere('ProID', pro)
        if(ans.length === 0)
            return null
        return ans[0]
    },
    async updateReview(newReview){
        return db('Review').where('SenderID', newReview.SenderID).andWhere('ReceiverID', newReview.ReceiverID).andWhere('ProID', newReview.ProID).update(newReview)
    },

    //update like point
    async updateLikePoint(userID){
        return db('User').where('UserID', userID).increment('LikePoint')
    },

    async updateDisLikePoint(userID){
        return db('User').where('UserID', userID).increment('DislikePoint')
    },

    //update status proid.
    async updateStatusProductByProID(proid){
        return db('Product').where('ProID', proid).update('Status', 1)
    },

    //get all request first bid
    async getBidderFirstRequest(proid){
        return db('Permission').where('ProID', proid).andWhere('Status', 0).select('BidderID')
    },

    //get username by userid.
    async getUsernameByUserID(userID){
        const list = await db('Account').where('UserID', userID).select('Username')
        return list[0].Username
    },


    //update status permisstion
    //get username by userid.
    async updateStatusPermission(userID, proid, time){
        return db('Permission').where('BidderID', userID).andWhere('ProID', proid).update('Status', 1).update('AcceptTime', time)
    },

    async updateStatusDenyPermission(userID, proid, time){
        return db('Permission').where('BidderID', userID).andWhere('ProID', proid).update('Status', 2).update('AcceptTime', time)
    },
}