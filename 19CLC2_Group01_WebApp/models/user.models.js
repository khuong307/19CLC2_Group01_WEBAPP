import db from '../utils/db.js'
export default {
    // Minh
    // Lấy toàn bộ seller
    async findALlSeller(){
        return db.select().table('Account').where('Type',2);
    },

    // Lấy toàn bộ seller chia bởi page
    async findPageBySeller(limit, offset){
        return db.select().table('Account').where('Type',2).limit(limit).offset(offset);
    },

    // Đếm số lượng seller
    async countSeller(){
        const list = await db('Account').where('Type',2).count({amount: 'UserID' })
        return list[0].amount
    },

    // Tìm toàn bộ bidder ngoại trừ Admin
    async findAllBidderExceptAdmin(userID){
        return db('Account').whereNot('UserID',userID);
    },

    // Đếm số lượng bidder ngoại trừ admin
    async countBidderExceptAdmin(userID){
        const list = await db('Account').whereNot('UserID',userID).count({amount: 'UserID' })
        return list[0].amount
    },

    // Lấy toàn bộ bidder ngoại trừ admin chia bởi page
    async findPageByBidderExAdmin(userID,limit, offset){
        return db.select().table('Account').whereNot('UserID',userID).limit(limit).offset(offset);
    },

    // Vô hiệu hóa Account
    disableAccount(userID){
        return db('Account').where('UserID',userID).update({Activate:-1});
    },

    // Tìm tất cả bidder muốn thành seller mà chưa được chấp nhận
    async findAllBidderUpgrade(){
        const list=await db('Account').join('ChangeLevel','Account.UserID','ChangeLevel.UserID').select('Account.UserID','Account.Username','ChangeLevel.Time').where('ChangeLevel.Status',0);
        return list;
    },

    // Tìm tất cả bidder muốn thành seller mà chưa được chấp nhận chia bởi page
    async findPageByUpgradeBidder(limit, offset){
        return db('Account').join('ChangeLevel','Account.UserID','ChangeLevel.UserID').select('Account.UserID','Account.Username','ChangeLevel.Time').where('ChangeLevel.Status',0).limit(limit).offset(offset);
    },

    // Đếm số lượng bidder muốn thành seller
    async countUpgradeBidder(){
        const list = await db('Account').join('ChangeLevel','Account.UserID','ChangeLevel.UserID').select('Account.UserID','Account.Username','ChangeLevel.Time').where('ChangeLevel.Status',0).count({amount: 'ChangeLevel.UserID' });
        return list[0].amount
    },

    // Lấy chi tiết dòng userID trong bảng ChangeLevel
    async findChangeLevelByID(userID){
        const list= await db('ChangeLevel').where('userID',userID).andWhere("Change",1).andWhere("Status",0);
        return list[0];
    },

    // Cập nhật bidder thành seller hoặc từ chối bidder thành seller
    upgradeChangeLevel(entity){
        const userID=entity.UserID;
        return db('ChangeLevel').where("UserID",userID).andWhere("Change",1).andWhere("Status",0).update(entity);
    },

    // Cập nhật bảng account thành seller
    upgradeAccToSeller(userID){
        return db('Account').where("UserID",userID).update({Type:2});
    },

    // Giáng cấp Seller thành Bidder
    downgradeSeller(userID){
        return db('Account').where("UserID",userID).update({Type:1});
    },

    // Thêm thông tin giáng cấp Seller thành Bidder trong bảng ChangeLevel
    insertDownSeller(entity){
        return db('ChangeLevel').insert(entity);
    },

    // Xóa user khỏi Watchlist
    deleteWatchList(userID){
        return db('WatchList').where('UserID',userID).del();
    },

    // Xóa user khỏi User
    deleteUser(userID){
        return db('User').where('UserID',userID).del();
    },

    // Xóa user khỏi Review
    deleteReview(userID){
        return db('Review').where('SenderID',userID).orWhere('ReceiverID',userID).del();
    },

    // Xóa user khỏi Product
    deleteProduct(userID){
        return db('Product').where('UploadUser',userID).orWhere('Winner',userID).del();
    },

    // Xóa user khỏi Permission
    deletePermission(userID){
        return db('Permission').where('BidderID',userID).del();
    },

    // Xóa user khỏi MaxPrice
    deleteMaxPrice(userID){
        return db('MaxPrice').where('UserID',userID).del();
    },

    // Xóa user khỏi Changelevel
    deleteChangeLevel(userID){
        return db('ChangeLevel').where('UserID',userID).del();
    },

    // Xóa user khỏi Auction
    deleteAuction(userID){
        return db('Auction').where('UserID',userID).orWhere('Header',userID).del();
    },

    // Xóa user khỏi Account
    deleteAccount(userID){
        return db('Account').where('UserID',userID).del();
    },

    // Tìm kiếm ProID theo UserID trong bảng Product
    async findProIDByUserID(userID){
        const listProID= await db('Product').select('ProID').where('UploadUser',userID);
        return listProID;
    },
}