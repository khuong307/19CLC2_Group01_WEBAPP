import db from '../utils/db.js'
export default {
    async countUser() {
        return db('User').count({NumberOfUser: 'UserID'})
    },
    async addNewAccount(newUser) {
        return db('Account').insert(newUser)
    },

    async addNewUser(newUser) {
        return db('User').insert(newUser)
    },

    async findByUsername(username) {
        const list = await db('Account').where('Username', username);
        if (list.length === 0) {
            return null;
        }
        return list[0];
    },

    async findByEmail(email) {
        const list = await db('User').where('Email', email);
        if (list.length === 0) {
            return null;
        }
        return list[0];
    },

    async InsertOTP(entity) {
        return db('OTP').insert(entity)
    },

    async InsertForgetPassOTP(entity) {
        return db('OTPForgetPass').insert(entity)
    },

    async findOTPByEmail(email) {
        const list = await db('OTP').where('Email', email)
        if (list.length === 0) {
            return null
        }
        return list[0]
    },

    async findOTPByEmailForgetPass(email) {
        const list = await db('OTPForgetPass').where('Email', email)
        if (list.length === 0) {
            return null
        }
        return list[0]
    },

    async findUserIDByEmail(email) {
        const list = await db('User').where('Email', email)
        if (list.length === 0) {
            return null
        }
        return list[0]
    },
    async UpdateActivateAccountByUserID(UserId) {
        return db('Account').where('UserID', UserId).update({Activate: '1'})
    },

    async deleteOTPLogin(email) {
        return db('OTP').where('Email', email).del()
    },

    async getAccountInfoByUsername(username) {
        const user = await db('Account').where({
            Username: username,
            Activate: 1
        })
        if (user.length === 0) {
            return null
        } else
            return user[0]
    },

    async getUserInfo(userID) {
        const list = await db('User').where('UserID', userID);
        if (list.length === 0)
            return null
        return list[0]
    },

    async getEmailByUserID(userID) {
        const ans = await db('User').where('UserID', userID).select('Email')
        if (ans.length === 0)
            return null;
        return ans[0]
    },

    async checkEmailInUser(email) {
        const list = await db('User').where('Email', email);
        if (list.length === 0) {
            return null
        }
        return list[0]
    },

    async getPasswordByUserID(userID) {
        const list = await db('Account').where('UserID', userID).select('Password')
        if (list.length === null) {
            return null
        }
        return list[0]
    },
    async UpdatePassByUserID(userID, newPass) {
        return db('Account').where('UserID', userID).update({Password: newPass})
    },

    async DelOTPCodeForget(email) {
        return db('OTPForgetPass').where('Email', email).del()
    },

    async getPointByUserID(userID) {
        const userPoint = await db('User').where('UserID', userID).select('LikePoint', 'DislikePoint')
        if (userPoint.length === 0)
            return null;
        return userPoint[0]
    },

    //update user profile.
    async updateProfileByUserID(userID, name, dob, address) {
        return db('User').where('UserID', userID).update({Name: name, Address: address, Dob: dob})
    },

    //check time for seller.
    async getSellerTimeValidByUserID(userID) {
        const user = await db('ChangeLevel').where('UserID', userID).orderBy('ChangeLevel.AcceptTime', 'DESC').select('ChangeLevel.AcceptTime')
        if (user.length === 0)
            return null
        return user[0]
    },
    async updateSellerOutDate(userID) {
        return db('Account').where('UserID', userID).update('Type', 1)
    },
    async updateActorById(userid, level) {
        return db('Account').where('UserID', userid).update({
            Type: level
        })
    },

    async updateEmailByUserID(userID, newEmail) {
        return db('User').where('UserID', userID).update({Email: newEmail})
    },


    //Minh
    // Minh: Lấy chi tiết User
    async getDetailUserInfo(userID){
        const list = await db('User').join('Account','Account.UserID','=','User.UserID').where('User.UserID', userID);
        if(list.length === 0)
            return null
        return list[0]
    },
}