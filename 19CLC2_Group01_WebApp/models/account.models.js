import db from '../utils/db.js'
export default {
    async countUser(){
        return db('User').count({NumberOfUser: 'UserID'})
    },
    async addNewAccount(newUser) {
        return db('Account').insert(newUser)
    },

    async addNewUser(newUser){
        return db('User').insert(newUser)
    },

    async findByUsername(username){
        const list = await db('Account').where('Username', username);
        if(list.length === 0){
            return null;
        }
        return list[0];
    },

    async findByEmail(email){
        const list = await db('User').where('Email', email);
        if(list.length === 0){
            return null;
        }
        return list[0];
    },

    async InsertOTP(entity){
        return db('OTP').insert(entity)
    },

    async findOTPByEmail(email){
        const list = await db('OTP').where('Email', email)
        if(list.length === 0){
            return null
        }
        return list[0]
    },

    async findUserIDByEmail(email){
        const list = await db('User').where('Email', email)
        if(list.length === 0){
            return null
        }
        return list[0]
    },
    async UpdateActivateAccountByUserID(UserId){
        return db('Account').where('UserID', UserId).update({Activate: '1'})
    },

    async getAccountInfoByUsername(username){
        const user = await db('Account').where({
            Username: username,
            Activate:  1
        })
        console.log(user)
        if(user.length === 0){
            return null
        }
        else
            return user[0]
    }
}