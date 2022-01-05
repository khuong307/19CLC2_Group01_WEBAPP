import db from '../utils/db.js';
export default{
    sendToAdmin(entity){
        return db('ChangeLevel').insert(entity);
    },

    async findById(userid){
        const lst = await db('ChangeLevel').where('UserID', userid).select();
        return lst;
    },

    async getPermissionByUserID(UserID, ProID){
        const lst = await db('Permission').where({
            'ProID': ProID,
            'BidderID': UserID
        }).select();
        return lst;
    },

    async insertToPermission(entity){
        return db('Permission').insert(entity);
    }
};