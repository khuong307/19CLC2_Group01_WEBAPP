import express from 'express';
import auth from '../middlewares/auth.mdw.js'
import BidderModels from "../models/bidder.models.js";

const router = express.Router();

router.get('/upgrade', auth, async function (req, res){
    req.session.retURL = req.originalUrl;
    console.log(res.locals.upgrade)
    if (res.locals.upgrade === "Can upgrade")
        res.render('vwBidder/upgrade', {
            view: true
        });
    else{
        res.render('vwBidder/upgrade', {
            view: false
        });
    }
});

router.post('/send-request', async function (req, res){
    const status = req.body.isAccept;
    const userid = req.session.authUser.UserID;
    const now = new Date();
    const entity = {
        UserID: userid,
        Time: now,
        Change: 1,
        Status: 0,
        AcceptTime: null
    };
    if (status === undefined){
        const ncheck = true;
        res.render('vwBidder/upgrade', {
            view: true,
            ncheck
        })
    }
    else{
        const ret = await BidderModels.sendToAdmin(entity);
        console.log(ret)
        res.redirect('/')
    }
});

export default router;