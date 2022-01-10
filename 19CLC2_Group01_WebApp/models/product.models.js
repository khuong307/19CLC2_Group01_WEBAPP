import db from '../utils/db.js'
export default {
    findAll(){
        return db.select().table('Product');
    },

    async findById(id){
        const list =  await db('Product').where('ProID', id).join('CategoryL2', 'Product.CatID2', '=', 'CategoryL2.CatID2').select('Product.*', {CatID1: 'CategoryL2.CatID1'})
        if(list.length === 0){
            return null
        }
        return list[0];
    },

    async findCatIDByProID(proID){
        const list =  await db('Product').where('ProID', proID)
        if(list.length === 0){
            return null
        }
        return list[0].CatID2;
    },

    deleteCate(id){
        console.log(id)
        return db('Product').where('ProID', id).del()
    },

    patchCate(entity){
        const id = entity.CatID;
        delete entity.id;
        return db('Product').where('ProID', id).update(entity)
    },

    findByCatID(CatID){
        return db('Product').where('CatID2', CatID)
    },

    findPageByCatID(CatID, limit, offset){
        return db('Product').where('Product.CatID2', CatID).limit(limit).offset(offset ).join('CategoryL2', 'Product.CatID2', '=', 'CategoryL2.CatID2').select('Product.*', {CatID1: 'CategoryL2.CatID1'})
    },

    async countByCatID(CatID){
        const list = await db('Product').where('CatID2', CatID).count({amount: 'ProID' })
        return list[0].amount
    },

    async getRelateProduct(CatID2, ProID){
        const list = await db('Product').where('CatID2', CatID2).andWhereNot('ProID', ProID).limit(5);
        return list;
    },

    async getCatID2FromProID(ProID){
        const CatID2 = await db('Product').select('Product.CatID2').where('ProID', ProID);
        return CatID2[0]
    },

    async getCatID1FromCatID2(CatID2){
        const CatID1 = await db('CategoryL2').select('CategoryL2.CatID1').where('CatID2', CatID2);
        return CatID1[0]
    },



    // Khang
    addToWatchList(entity){
        return db('WatchList').insert(entity);
    },

    delFromWatchList(entity){
        return db('WatchList').where({
            'UserID': entity.UserID,
            'ProID': entity.ProID
        }).del();
    },

    async getWatchListFromUserID(id, limit, offset){
        const lst = await db('Product').join('WatchList', 'Product.ProID',
            '=', 'WatchList.ProID').where('WatchList.UserID', id).limit(limit).offset(offset).select();
        return lst;
    },

    async getAuctionByProIDWithLimit(id, limit, offset){
        const raw_sql = `select * from Account acc join Auction auc on acc.UserID = auc.UserID where ProID = '${id}' and auc.UserID in (select distinct UserID from Auction where ProID = '${id}' and UserID not in (select UserID from Auction where Status = 0 and ProID = '${id}')) order by auc.Time desc limit ${limit} offset ${offset}`;
        const lst = await db.raw(raw_sql);
        return lst[0];
    },

    async getAuctionByProID(id){
        const lst = await db('Auction').where('ProID', id).orderBy('Time', 'desc').select();
        return lst;
    },

    async getLengthAuction(id){
        const raw_sql = `select * from Auction where ProID = '${id}' and UserID in (select distinct UserID from Auction where ProID = '${id}' and UserID not in (select UserID from Auction where Status = 0 and ProID = '${id}'))`;
        const lst = await db.raw(raw_sql);
        return lst[0].length;
    },

    async getMaxPriceByProID(ProID){
        const lst = await db('MaxPrice').where('ProID', ProID).orderBy('MaxPrice', 'desc').orderBy('Time', 'asc').select();
        return lst;
    },

    insertAuction(entity){
        return db('Auction').insert(entity);
    },

    updatePriceProduct(entity){
        return db('Product').where('ProID', entity.ProID).update({
            'CurrentPrice': entity.Price
        });
    },

    updateWinnerProduct(entity){
        return db('Product').where('ProID', entity.ProID).update({
            'Winner': entity.Header
        });
    },

    async getAuctionByProIDAndUserID(UserID, ProID){
        const lst = await db('Auction').where({
            'ProID': ProID,
            'UserID': UserID
        }).select();
        return lst;
    },

    async getAuctionByUserID(UserID){
        const lst = await db('Auction').where('UserID', UserID).orderBy('AcceptTime', 'asc').select();
        return lst;
    },

    async getAuctioningList(UserID, time){
        const raw_sql = `select distinct auc.ProID from Auction auc join Product p on auc.ProID = p.ProID where auc.UserID = '${UserID}' and '${time}' < EndDate and Winner is null and auc.ProID not in (select ProID from Auction where Status = 0 and UserID = '${UserID}')`;
        const lst = await db.raw(raw_sql);
        return lst[0];
    },

    async getAuctioningListWithLimitOffset(UserID, time, limit, offset){
        const raw_sql = `select distinct auc.ProID from Auction auc join Product p on auc.ProID = p.ProID where auc.UserID = '${UserID}' and '${time}' < EndDate and Winner is null and auc.ProID not in (select ProID from Auction where Status = 0 and UserID = '${UserID}') order by auc.ProID limit ${limit} offset ${offset}`;
        const lst = await db.raw(raw_sql);
        return lst[0];
    },

    async getWinningList(userID){
        const lst = await db('Product').where('Winner', userID).select();
        return lst;
    },

    async getWinningListWithLimitOffset(userID, limit, offset){
        const lst = await db('Product').where('Winner', userID).limit(limit).offset(offset);
        return lst;
    },

    updateProductEndTime(ProID, time){
        return db('Product').where('ProID', ProID).update('EndDate', time);
    },

    updateProductSendEmailStatus(ProID){
        return db('Product').where('ProID', ProID).update('isSendEmail', 1);
    },
    // Khang

    async getWatchListByUserID(userID){
        const list = await db('WatchList').where('UserID', userID)
        return list
    }

}