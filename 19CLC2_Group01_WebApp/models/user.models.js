import db from '../utils/db.js'
export default {
    // Minh
    // Lấy toàn bộ seller
    async findALlSeller(){
        return db.select().table('Account').where('Type',2);
    },

    // Tìm toàn bộ bidder ngoại trừ Admin
    async findAllBidderExceptAdmin(UserID){
        return db('Account').whereNot('UserID',UserID);
    },

    // Lấy thông tin User
    async getUserInfo(userID){
        const list = await db('User').where('UserID', userID);
        if(list.length === 0)
            return null;
        return list[0];
    },

    // Vô hiệu hóa Account
    disableAccount(userID){
        return db('Account').where('UserID',userID).update({Activate:0});
    },

    // Tìm tất cả bidder muốn thành seller mà chưa được chấp nhận
    async findAllBidderUpgrade(){
        const list=await db('Account').join('ChangeLevel','Account.UserID','ChangeLevel.UserID').select('Account.UserID','Account.Username','ChangeLevel.Time').where('ChangeLevel.Status',0);
        return list;
    },

    // Lấy chi tiết dòng userID trong bảng ChangeLevel
    async findChangeLevelByID(userID){
        const list= await db('ChangeLevel').where('userID',userID);
        return list[0];
    },

    // Cập nhật bidder thành seller
    upgradeChangeLevel(entity){
        const userID=entity.UserID;
        return db('ChangeLevel').where("UserID",userID).update(entity);
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
}