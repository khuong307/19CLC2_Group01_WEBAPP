export default function auth(req, res, next){
    if(req.session.auth === false){ //chưa đăng nhập.
        req.session.retURL = req.originalUrl
        return res.redirect('/account/login')
    }
    next()
}