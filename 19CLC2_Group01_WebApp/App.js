import express from 'express'
import morgan from 'morgan' // ghi lại nhật ký tình trạng trang web
import activateLocalMdw from './middlewares/local.middleware.js'
import activateViewMdw from './middlewares/view.mdw.js'
import activateErrorMdw from './middlewares/error.mdw.js'
import activateRoutesMdw from './middlewares/routes.mdw.js'
import activateSessionMdw from './middlewares/session.mdw.js'

const app = express()
app.use(morgan('dev'))
//hinh anh.
app.use('/public', express.static('public'))
//app.use('/css', express.static('css'))
// cần có dòng này để có thể thực hiện các thao tác POST.
app.use(express.urlencoded({extended: true}))

activateSessionMdw(app) //gọi các session.
activateLocalMdw(app) //gọi middlewares
activateViewMdw(app) // gọi handlebars.
activateRoutesMdw(app) //goị các file app.get
activateErrorMdw(app) //gọi các error handling.




const port = 3000
app.listen(port, function(){
    console.log(`Example app listening at http://localhost:${port}`)
})