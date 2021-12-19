import db from '../utils/db.js'
export default {
    // Minh
    async findALlSeller(){
        return db.select().table('Account').where('Type',2);
    },

    async findAllBidderExceptAdmin(UserID){
        return db('Account').whereNot('UserID',UserID);
    }


}