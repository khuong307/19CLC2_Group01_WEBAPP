import db from '../utils/db.js';
export default{
    sendToAdmin(entity){
        return db('ChangeLevel').insert(entity);
    }
};