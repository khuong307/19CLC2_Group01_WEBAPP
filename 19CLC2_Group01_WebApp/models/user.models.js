import db from '../utils/db.js'
export default {
    // Minh
    async findALlSeller(){
        return db.select().table('Account').where('Type',2);
    },

    async findAllBidderExceptAdmin(UserID){
        return db('Account').whereNot('UserID',UserID);
    },

    async getUserInfo(userID){
        const list = await db('User').where('UserID', userID);
        if(list.length === 0)
            return null
        return list[0]
    },
}