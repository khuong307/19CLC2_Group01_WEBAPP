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
        const lst = await db('Account', 'Auction').join('Auction', 'Auction.UserID',
            '=', 'Account.UserID').where('ProID', id).orderBy('Auction.Time', 'desc').offset(offset).limit(limit).select();
        return lst;
    },

    async getLengthAuction(id){
        const lst = await db('Auction').where('ProID', id);
        return lst.length;
    },

    async getMaxPriceByProID(ProID){
        const lst = await db('MaxPrice').where('ProID', ProID).orderBy('MaxPrice', 'desc').orderBy('Time', 'asc').select();
        return lst;
    },

    insertAuction(entity){
        return db('Auction').insert(entity);
    },

    updatePriceAndWinnerProduct(entity){
        return db('Product').where('ProID', entity.ProID).update({
            'Winner': entity.Header,
            'CurrentPrice': entity.Price
        });
    },
    // Khang

    async getWatchListByUserID(userID){
        const list = await db('WatchList').where('UserID', userID)
        return list
    }

}