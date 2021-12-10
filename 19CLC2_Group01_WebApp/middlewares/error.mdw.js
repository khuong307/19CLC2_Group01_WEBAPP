//handling error.
export default function(app) {
    //500
    app.use(function(err, req, res, next) {
        res.render('500', {layout: false})
    })
    //404
    app.use(function(req, res, next) {
        res.render('404', {layout: false})
    })
}