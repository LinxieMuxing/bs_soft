import Koa from 'koa'
import bodyparser from 'koa-bodyparser'
import Koajwt from 'koa-jwt'
import router from './router.mjs'
import config from './config.mjs'
import cors from 'koa2-cors'
import serve from  'koa-static'
import fs from 'fs'
import path from 'path'
const app = new Koa()
//挂载静态资源
app.use(serve('/home/bs_soft/admin-server'))
//解决CORS跨域问题
app.use(cors({
    origin: '*',
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
}))
//使用JWT进行身份验证
app.use(Koajwt({secret: config.SECRET, passthrough: true}).unless({
    path: ['/api/login']
}))
//对JSON格式进行解析
app.use(bodyparser())
//挂载路由
app.use(router.routes())
//对端口进行监听
app.listen(8000, ()=>{
    console.log('listening http://127.0.0.1:8000');
})