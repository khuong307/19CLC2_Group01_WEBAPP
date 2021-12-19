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

    findPageByUploadUser(UploadUserID, limit, offset){
        return db('Product').where('Product.UploadUser', UploadUserID).orderBy('Product.UploadDate', 'DESC').limit(limit).offset(offset).select('Product.*')
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

    async countWatchList(userID){
        if(userID === null){
            return null
        }
        const lst = await db('WatchList').count({ WatchListCount: 'UserID' }).where('UserID',userID);
        return lst[0].WatchListCount;
    },

    async getWatchListFromUserID(id, limit, offset){
        const lst = await db('Product').join('WatchList', 'Product.ProID',
            '=', 'WatchList.ProID').where('WatchList.UserID', id).limit(limit).offset(offset).select();
        return lst;
    },
    // Khang

    async getWatchListByUserID(userID){
        const list = await db('WatchList').where('UserID', userID)
        if (list.length === 0){
            return null
        }
        return list
    },

    //top5.
    //top 5 price.
    async getTop5ByPrice(){
        return db('Product').orderBy('CurrentPrice', 'desc').limit(5);
    },
    async getTop5byClose(){
        return db('Product').orderBy('EndDate').limit(5);
    },
    async getTop5ByAuction(){
        return db('Auction').count('Auction.ProID', {as: 'NumberOfAuction'}).groupBy('Auction.ProID').orderBy('NumberOfAuction', 'desc').limit(5).select('Auction.ProID', 'Product.*').join('Product', 'Product.ProID', '=', 'Auction.ProID')
    },


    //checkUploadUserbyProid.
    async getSellerNamebyUploadUserID(Userid){
        const user = await db('Account').where('UserID', Userid)
        if (user.length === 0){
            return null;
        }
        return user[0]
    },

    //check highes bidder.
    async getUsernameMaxPriceByProID(proID){
        const pro = await db('MaxPrice').join('Account', 'MaxPrice.UserID', '=', 'Account.UserID').andWhere('ProID', proID).select('Account.Username', 'Account.UserID').orderBy('MaxPrice.MaxPrice', 'DESC')
        if (pro.length === 0){
            return null;
        }
        return pro[0]
    },

    //count luot ra gia.
    async getNumberofAuctionByProID(proID){
        const num = await db('Auction').count('ProID', {as: 'NumberOfAuction'}).where('ProID', proID)
        if (num.length === 0)
            return null
        return num[0]
    },

    async searchProductFulltext(content){
        const sql = `select ProInfoSearch.ProID
                     from ProInfoSearch
                     where
                         MATCH(ProName)
                         AGAINST('${content}')
                        or
                         MATCH(TinyDes)
                         AGAINST('${content}')
                        or
                         MATCH(FullDes)
                         AGAINST('${content}')
                        or
                         MATCH(CatName1)
                         AGAINST('${content}')
                        or
                         MATCH(CatName2)
                         AGAINST('${content}')`;

        const raw = await db.raw(sql);
        if(raw.length === 0)
            return null
        else
            return raw[0]
    },

    async searchProductFullTextSearchWithLimitOffset(content, limit, offset){
        const sql = `select distinct ProInfoSearch.ProID
                     from ProInfoSearch
                     where
                         MATCH(ProName)
                         AGAINST('${content}')
                        or
                         MATCH(TinyDes)
                         AGAINST('${content}')
                        or
                         MATCH(FullDes)
                         AGAINST('${content}')
                        or
                         MATCH(CatName1)
                         AGAINST('${content}')
                        or
                         MATCH(CatName2)
                         AGAINST('${content}')
                         LIMIT ${limit} 
                         OFFSET ${offset}`;

        const raw = await db.raw(sql);
        if(raw.length === 0)
            return null
        else
            return raw[0]
    },

    async searchProductFullTextSearchType1(content, limit, offset){
        const sql = `select distinct ProInfoSearch.ProID
                     from ProInfoSearch
                     where
                         MATCH(ProName)
                         AGAINST('${content}')
                        or
                         MATCH(TinyDes)
                         AGAINST('${content}')
                        or
                         MATCH(FullDes)
                         AGAINST('${content}')
                        or
                         MATCH(CatName1)
                         AGAINST('${content}')
                        or
                         MATCH(CatName2)
                         AGAINST('${content}')
                     ORDER BY ProInfoSearch.CurrentPrice ASC
                         LIMIT ${limit} 
                         OFFSET ${offset}`;

        const raw = await db.raw(sql);
        console.log(123456)
        if(raw.length === 0)
            return null
        else
            return raw[0]
    },

    async searchProductFullTextSearchType2(content, limit, offset){
        const sql = `select distinct ProInfoSearch.ProID
                     from ProInfoSearch
                     where
                         MATCH(ProName)
                         AGAINST('${content}')
                        or
                         MATCH(TinyDes)
                         AGAINST('${content}')
                        or
                         MATCH(FullDes)
                         AGAINST('${content}')
                        or
                         MATCH(CatName1)
                         AGAINST('${content}')
                        or
                         MATCH(CatName2)
                         AGAINST('${content}')
                     ORDER BY ProInfoSearch.EndDate DESC
                     LIMIT ${limit} 
                     OFFSET ${offset}`;

        const raw = await db.raw(sql);
        console.log(raw[0])
        if(raw.length === 0)
            return null
        else
            return raw[0]
    },

    async getProductByProID(proID){
        const list = await db('Product').where('ProID', proID);
        if(list.length === 0)
            return null
        else{
            return list[0]
        }
    },

    async getDescriptionHistoryByProID(proID){
        const listHistory = await db('DescriptionHistory').where('ProID', proID).orderBy('Time')
        if (listHistory.length === 0){
            return null;
        }
        else
            return listHistory
    },

    async InsertNewDescriptionByProID(proID, now, info){
        return db('DescriptionHistory').insert({ProID: proID, Time: now, Description: info})
    },

    //get bidderinfo
    async getBidderInfoByProID(proID){
        const list = await db('Auction').where('ProID', proID).orderBy('Price').join('Account', 'Account.UserID', '=', 'Auction.UserID').select('Account.UserID','Auction.Price', 'Account.Username', 'Auction.Header', 'Auction.Status')
        if(list.length === 0){
            return null;
        }else{
            return list;
        }
    },

    async getUsernameByUserID(userID){
        const list = await db('Account').where('UserID', userID).select('Username')
        if(list.length === 0){
            return null;
        }else{
            return list[0]
        }
    },

    async getMaxBidderByProID(proID){
        return await db('MaxPrice').where('ProID', proID).orderBy('MaxPrice').select('UserID')
    },

    async updateStatusAuctionByUserID(userID){
        return db('Auction').where('UserID', userID).update('Status', 0)
    }

}