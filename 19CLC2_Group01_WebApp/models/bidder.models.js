import db from '../utils/db.js';
export default{
    sendToAdmin(entity){
        return db('ChangeLevel').insert(entity);
    },

    async findById(userid){
        const lst = await db('ChangeLevel').where('UserID', userid).select();
        return lst;
    },

    async getPermissionByUserIDAndProID(UserID, ProID){
        const lst = await db('Permission').where({
            'ProID': ProID,
            'BidderID': UserID
        }).select();
        return lst;
    },

    insertToPermission(entity){
        return db('Permission').insert(entity);
    },

    updateMaxPrice(entity){
        return db('MaxPrice').where({
            'UserID': entity.UserID,
            'ProID': entity.ProID
        }).update({
            'MaxPrice': entity.MaxPrice,
            'Time': entity.Time
        });
    },

    insertMaxPrice(entity){
        return db('MaxPrice').insert(entity);
    },

    async selectMaxPrice(entity){
        const obj = await db('MaxPrice').count('* as Num').where({
            'UserID': entity.UserID,
            'ProID': entity.ProID
        });
        return obj;
    },

    async getPermissionByUserID(UserID){
        const lst = await db('Permission').where('BidderID', UserID).select();
        return lst;
    }
};