import express from 'express';
import auth from '../middlewares/auth.mdw.js'
import moment from "moment";
import BidderModels from "../models/bidder.models.js";

const router = express.Router();

router.get('/upgrade', auth, function (req, res){
    req.session.retURL = req.originalUrl;
    res.render('vwBidder/upgrade');
});

router.post('/send-request', async function (req, res){
    const status = req.body.isAccept;
    const userid = req.session.authUser.UserID;
    const now = new Date();
    const date = moment(now).format("YYYY-MM-DD HH:MM:SS");
    const entity = {
        UserID: userid,
        Time: date,
        Change: 1,
        Status: 0,
        AcceptTime: null
    };
    if (status === undefined){
        res.redirect('/bidder/upgrade')
    }
    else{
        const ret = await BidderModels.sendToAdmin(entity);
        console.log(ret)
        res.redirect('/')
    }
});

export default router;