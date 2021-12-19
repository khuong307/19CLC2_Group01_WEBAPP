import db from '../utils/db.js';
export default{
    sendToAdmin(entity){
        return db('ChangeLevel').insert(entity);
    },

    async findById(userid){
        const lst = await db('ChangeLevel').where('UserID', userid).select();
        return lst[lst.length-1];
    }
};