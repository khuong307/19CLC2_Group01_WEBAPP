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
    },

    insertReview(entity){
        return db('Review').insert(entity);
    },

    async getReviewWithUserID(UserID){
        const lst = await db('Review').join('Account', 'Account.UserID', '=',
            'Review.SenderID').where('ReceiverID', UserID).orderBy('Time', 'desc').select();
        return lst;
    },

    updatePoint(entity){
        if (entity.Status == 0)
            return db('User').where('UserID', entity.ReceiverID).increment('DislikePoint', 1);
        else
            return db('User').where('UserID', entity.ReceiverID).increment('LikePoint', 1);
    }
};