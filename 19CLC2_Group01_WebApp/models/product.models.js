import db from '../utils/db.js'
import moment from 'moment'; //format date.
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
        return db('Product').where('Product.CatID2', CatID).andWhere('Product.EndDate', '>', new Date()).whereNull('Winner').limit(limit).offset(offset ).join('CategoryL2', 'Product.CatID2', '=', 'CategoryL2.CatID2').select('Product.*', {CatID1: 'CategoryL2.CatID1'})
    },

    findPageByUploadUser(UploadUserID, limit, offset){
        return db('Product').where('Product.UploadUser', UploadUserID).andWhere('Product.EndDate', '>', new Date()).whereNull('Winner').orderBy('Product.UploadDate', 'DESC').limit(limit).offset(offset).select('Product.*')
    },

    findOutDatePageByUploadUser(UploadUserID, limit, offset){
        return db('Product').where('Product.UploadUser', UploadUserID).whereNull('Winner').andWhere('Product.EndDate', '<', new Date()).orderBy('Product.UploadDate', 'DESC').limit(limit).offset(offset).select('Product.*')
    },
    findSoldPageByUploadUser(UploadUserID, limit, offset){
        return db('Product').where('Product.UploadUser', UploadUserID).whereNotNull('Winner').orderBy('Product.UploadDate', 'DESC').limit(limit).offset(offset).select('Product.*')
    },


    async countByCatID(CatID){
        const list = await db('Product').where('CatID2', CatID).whereNull('Winner').andWhere('Product.EndDate', '>', new Date()).count({amount: 'ProID' })
        return list[0].amount
    },

    async getRelateProduct(CatID2, ProID){
        const list = await db('Product').where('CatID2', CatID2).andWhere('Product.EndDate', '>', new Date()).andWhereNot('ProID', ProID).whereNull('Winner').limit(5);
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
        const lst = await db('WatchList').count({ WatchListCount: 'UserID' }).where('UserID',userID).join('Product', 'Product.ProID', '=', 'WatchList.ProID').whereNull('Product.Winner')
        return lst[0].WatchListCount;
    },

    async getWatchListFromUserID(id, limit, offset){
        const now = moment(new Date()).utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss')
        const lst = await db('Product').join('WatchList', 'Product.ProID',
            '=', 'WatchList.ProID').where('WatchList.UserID', id).andWhere('Product.EndDate','>', now ).whereNull('Product.Winner').limit(limit).offset(offset).select();
        return lst;
    },
    // Khang

    async getWatchListByUserID(userID){
        const list = await db('WatchList').join('Product', 'Product.ProID', '=', 'WatchList.ProID').whereNull('Product.Winner').andWhere('WatchList.UserID', userID)
        if (list.length === 0){
            return null
        }
        return list
    },

    //top5.
    //top 5 price.
    async getTop5ByPrice(){
        return db('Product').where('Product.EndDate', '>', new Date()).whereNull('Winner').orderBy('CurrentPrice', 'desc').limit(5);
    },
    async getTop5byClose(){
        return db('Product').where('Product.EndDate', '>', new Date()).whereNull('Winner').orderBy('EndDate').limit(5);
    },
    async getTop5ByAuction(){
        return db('Auction').where('Product.EndDate', '>', new Date()).whereNull('Winner').count('Auction.ProID', {as: 'NumberOfAuction'}).groupBy('Auction.ProID').orderBy('NumberOfAuction', 'desc').limit(5).select('Auction.ProID', 'Product.*').join('Product', 'Product.ProID', '=', 'Auction.ProID')
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
        const now = moment(new Date()).utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss')
        const sql = `select distinct ProInfoSearch.ProID
                     from ProInfoSearch, Product
                     where
                         ProInfoSearch.EndDate > '${now}' AND ProInfoSearch.ProID = Product.ProID AND Product.Winner is null
                     AND
                         (MATCH(ProInfoSearch.ProName)
                         AGAINST('${content}')
                        or
                         MATCH(ProInfoSearch.TinyDes)
                         AGAINST('${content}')
                        or
                         MATCH(ProInfoSearch.FullDes)
                         AGAINST('${content}')
                        or
                         MATCH(ProInfoSearch.CatName1)
                         AGAINST('${content}')
                        or
                         MATCH(ProInfoSearch.CatName2)
                         AGAINST('${content}'))`;

        const raw = await db.raw(sql);
        console.log(raw[0].length)
        if(raw[0].length === 0)
            return null
        else
            return raw[0]
    },

    async searchProductFullTextSearchWithLimitOffset(content, limit, offset){
        const now = moment(new Date()).utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss')
        const sql = `select distinct ProInfoSearch.ProID
                     from ProInfoSearch, Product
                     where
                         ProInfoSearch.EndDate > '${now}' AND ProInfoSearch.ProID = Product.ProID AND Product.Winner is null
                       AND
                         (MATCH(ProInfoSearch.ProName)
                             AGAINST('${content}')
                             or
                             MATCH(ProInfoSearch.TinyDes)
                             AGAINST('${content}')
                             or
                             MATCH(ProInfoSearch.FullDes)
                             AGAINST('${content}')
                             or
                             MATCH(ProInfoSearch.CatName1)
                             AGAINST('${content}')
                             or
                             MATCH(ProInfoSearch.CatName2)
                             AGAINST('${content}'))
                         LIMIT ${limit} 
                         OFFSET ${offset}`;

        const raw = await db.raw(sql);
        if(raw.length === 0)
            return null
        else
            return raw[0]
    },

    async searchProductFullTextSearchType1(content, limit, offset){
        const now = moment(new Date()).utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss')
        const sql = `select distinct ProInfoSearch.ProID
                     from ProInfoSearch, Product
                     where
                         ProInfoSearch.EndDate > '${now}' AND ProInfoSearch.ProID = Product.ProID AND Product.Winner is null
                       AND
                         (MATCH(ProInfoSearch.ProName)
                             AGAINST('${content}')
                             or
                             MATCH(ProInfoSearch.TinyDes)
                             AGAINST('${content}')
                             or
                             MATCH(ProInfoSearch.FullDes)
                             AGAINST('${content}')
                             or
                             MATCH(ProInfoSearch.CatName1)
                             AGAINST('${content}')
                             or
                             MATCH(ProInfoSearch.CatName2)
                             AGAINST('${content}'))
                     ORDER BY ProInfoSearch.CurrentPrice ASC
                         LIMIT ${limit} 
                         OFFSET ${offset}`;

        const raw = await db.raw(sql);
        if(raw.length === 0)
            return null
        else
            return raw[0]
    },

    async searchProductFullTextSearchType2(content, limit, offset){
        const now = moment(new Date()).utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss')
        const sql = `select distinct ProInfoSearch.ProID
                     from ProInfoSearch, Product
                     where
                         ProInfoSearch.EndDate > '${now}' AND ProInfoSearch.ProID = Product.ProID AND Product.Winner is null
                       AND
                         (MATCH(ProInfoSearch.ProName)
                             AGAINST('${content}')
                             or
                             MATCH(ProInfoSearch.TinyDes)
                             AGAINST('${content}')
                             or
                             MATCH(ProInfoSearch.FullDes)
                             AGAINST('${content}')
                             or
                             MATCH(ProInfoSearch.CatName1)
                             AGAINST('${content}')
                             or
                             MATCH(ProInfoSearch.CatName2)
                             AGAINST('${content}'))
                     ORDER BY ProInfoSearch.EndDate DESC
                     LIMIT ${limit} 
                     OFFSET ${offset}`;

        const raw = await db.raw(sql);
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
    async getValidProductByProID(proID){
        const list = await db('Product').where('ProID', proID).whereNull('Winner');
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
        const now = new Date()
        return db('Auction').where('UserID', userID).update({
            Status: 0,
            AcceptTime: now
        })

    },

    async getProNameByProID(proID){
        const ans = await db('Product').where('ProID', proID).select('ProName')
        if(ans.length === 0)
            return null
        return ans[0]
    },

    async getEmailByUserID(userID){
        const email = await db('User').where('UserID', userID)
        if(email.length === 0)
            return null
        return email[0]
    },
    async getMaxPriceByUserIDProID(proID, userID){
        const ans = await db('MaxPrice').where('ProID', proID).andWhere('UserID', userID).select('MaxPrice')
        if(ans.length === 0)
            return null
        return ans[0]
    },

    async getUserIDHasMaxPrice(proID, maxPrice){
        const ans = await db('MaxPrice').where('ProID', proID).andWhere('MaxPrice', maxPrice).select('UserID')
        if(ans.length === 0)
            return null;
        return ans[0]
    },
    async delByUserIDInMaxPrice(userID){
        return db('MaxPrice').where('UserID', userID).del()
    },
    async getSecondPriceInAuction(proID){
        const ans = await db('Auction').where('ProID', proID).andWhere('Status', '1').orderBy('Price', 'ASC')
        console.log(ans)
        if(ans.length === 0)
            return null
        else
            return ans[ans.length - 2]
    },
    async getThirdPriceInMaxPrice(proID){
        const ans = await db('MaxPrice').where('ProID', proID).orderBy('MaxPrice', 'ASC')
        if(ans.length === 0)
            return null
        else
            return ans[ans.length - 3]
    },
    async updateCurrentPriceByProID(proID, newPrice){
        return db('Product').where('ProID', proID).update('CurrentPrice', newPrice)
    },
    async updateAuctionPriceMaxBidder(proID, userID, newPrice){
        return db('Auction').where('ProID', proID).where('UserID', userID).update('Price', newPrice)
    },
    async getStepPriceByProID(proID){
        return db('Product').where('ProID', proID).select('StepPrice', 'CurrentPrice')
    },
    async delWatchListOutDate(){
        const now = moment(new Date()).utcOffset('+0700').format('YYYY-MM-DD HH:mm:ss')
        const watch = await db('Product').where('EndDate', '<', now).whereNull('Winner').select('ProID')
        if (watch.length > 0){
            for(const c of watch){
                const outDateProID = await db('WatchList').where('ProID', c.ProID)
                for(const d of outDateProID){
                    const outDateProID = await db('WatchList').where('ProID', d.ProID).andWhere('UserID', d.UserID).del()
                }
            }
        }
    },
    //get review
    async getReviewSellerSide(sellerID, bidderID, proID){
        const ans = await db('Review').where('SenderID', sellerID).andWhere('ReceiverID', bidderID).andWhere('ProID', proID)
        if (ans.length === 0)
            return null;
        return ans[0]
    },

    async getReviewBidderSide(bidderID,sellerID, proID){
        const ans = await db('Review').where('SenderID', bidderID).andWhere('ReceiverID', sellerID).andWhere('ProID', proID)
        if (ans.length === 0)
            return null;
        return ans[0]
    },

    // sort by price by CatID2.
    async getProductsByCatID2ByPrice(CatID2, limit, offset){
        const res = await db('Product').where('CatID2', CatID2).whereNull('Winner').andWhere('EndDate', '>', new Date()).orderBy('CurrentPrice', 'ASC').limit(limit).offset(offset).select('ProID')
        if(res.length === 0)
            return null
        return res
    },

    async getProductsByCatID2ByDate(CatID2, limit, offset){
        const res = await db('Product').where('CatID2', CatID2).whereNull('Winner').andWhere('EndDate', '>', new Date()).orderBy('EndDate', 'DESC').limit(limit).offset(offset).select('ProID')
        if(res.length === 0)
            return null
        return res
    },
    async getProductsByCatID2(CatID2){
        const res = await db('Product').where('CatID2', CatID2).whereNull('Winner').andWhere('EndDate', '>', new Date())
        if(res.length === 0)
            return null
        return res
    },

    // Minh
    findAllWithIdCate(){
        return db.select().table('Product').join('CategoryL2','Product.CatID2','=','CategoryL2.CatID2');
    },

    findBidderByProId(ProID){
        return db.select().table('User').join('MaxPrice','MaxPrice.UserID','=','User.UserID').where('MaxPrice.ProID',ProID);
    },

    findSellerByProId(ProID){
        return db.select().table('User').join('Product','Product.UploadUser','=','User.UserID').where('Product.ProID',ProID);
    },

    delPermisByProId(ProID){
        return db('Permission').where('ProID', ProID).del();
    },

    delMaxPriceByProId(ProID){
        return db('MaxPrice').where('ProID', ProID).del();
    },

    delAuctionByProId(ProID){
        return db('Auction').where('ProID', ProID).del();
    },

    delDescriptionByProId(ProID){
        return db('DescriptionHistory').where('ProID', ProID).del();
    },

    delWatchListByProId(ProID){
        return db('WatchList').where('ProID', ProID).del();
    },

    delProInfoSearchByProId(ProID){
        return db('ProInfoSearch').where('ProID', ProID).del();
    },

    delProductByProId(ProID){
        return db('Product').where('ProID', ProID).del();
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

    async getAuctionPriceByProID(proID,userID){
        const lst = await db('Auction').where('ProID', proID).andWhere('UserID', userID).orderBy('Time', 'desc').select();
        return lst;
    },

    async getAuctionPriceByProIDOneBidder(proID,userID){
        const lst = await db('Auction').where('ProID', proID).andWhere('UserID', userID).orderBy('Time', 'ASC').select();
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


    deleteMaxPriceByProIDUserID(proid, userid){
        return db('MaxPrice').where('ProID', proid).andWhere('UserID', userid).del()
    },


    //Minh

    // Đếm số lượng product
    async countProduct(){
        let now=new Date();
        const list = await db('Product').whereNull('Winner').andWhere('EndDate','>=',now).count({amount: 'ProID' })
        return list[0].amount
    },

    // Lấy toàn bộ product chia bởi page
    findPageByProduct(limit, offset){
        let now=new Date();
        return db.select().table('Product').join('CategoryL2','Product.CatID2','=','CategoryL2.CatID2').whereNull('Winner').andWhere('EndDate','>=',now).orderBy('Product.ProID').limit(limit).offset(offset);
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
}