import Router from 'koa-router'
import query from './query.mjs'
import config from "./config.mjs"
import jsonwebtoken from 'jsonwebtoken'
import formidable from 'koa-formidable'
import fs from 'fs'
import path from 'path'
import childp from 'child_process'

const exec = childp.exec

const router = new Router()
const SECRET = config.SECRET
//创建新文件
let mkdirs = (dirname, callback)=> {
    fs.exists(dirname, function(exists) {
        if (exists) {
            callback();
        } else {
            mkdirs(path.dirname(dirname), function() {
                fs.mkdir(dirname, callback);
            });
        }
    });
};
//用户登陆
router.post('/api/login', async ctx => {
    let { username, password } = ctx.request.body;
    //console.log(`${username}, ${password}`)
    let { rows: result } = await query(`select id, pass, identity from id_pass where id='${username}' limit 1`);
    let { rows: info } = await query(`select id, name from user_info where id='${username}' limit 1`);
    console.log(result)

     if (result[0] && password === result[0].pass) {
        ctx.body = {
            status: 200,
            message: '登录成功',
            name: info[0].name,
            id: info[0].id,
            identity: result[0].identity,
            token: jsonwebtoken.sign(
                username,
                SECRET
            )
        }
    } else {
        ctx.body = {
            status: 400,
            message: '用户名密码不匹配'
        }
    }
});
//用户注册
router.post('/api/logon', async ctx => {
    let { id, pass, name, sex, age, nation, marriage, profession, birthday, inTime, tel, history } = ctx.request.body;
    try{
        let { rows: result1 } = await query(`insert into id_pass values('${id}', '${pass}', 'user')`);
        let { rows: result2 } = await query( `insert into user_info values('${id}', '${name}', '${sex}', ${age}, '${nation}', '${marriage}', '${profession}','${birthday}','${inTime}','${tel}','${history}' `);
        ctx.body = {
            status: 200,
            message: '用户注册成功'
        }
    }catch(err){
        console.log(err)
        ctx.body = {
            status: 400,
            message: '用户注册失败'
        }
    }
});
//上传文件到服务器
router.post('/api/img', async ctx => {
    let form = formidable.parse(ctx.request)
    let nickName = ""
    let id = ""
    let checkTime = ""
    function formImage() {//文件重命名
        return new Promise((resolve, reject) => {
            form((opt, {fields ,files})=> {
                let nickname = fields.nickname;
                let filename = files.file.name;
                console.log(files.file.path);//本地缓存中的文件
                let uploadDir = 'public/upload/';
                //let avatarName = Date.now() + '_' + filename;
                let avatarName = Date.now() + '_' + nickname + '.' + filename.split(".")[1];
                mkdirs('public/upload', function() {
                    fs.renameSync(files.file.path, uploadDir  + avatarName); //重命名
                    resolve()
                })
                nickName = avatarName;//全局变量
                id = fields.id;
                checkTime = nickName.split("_")[0];
            })
        })
    }
    function pythonImage(Name){//python执行代码
        exec(`python /home/bs_soft/CCBANet-main/zxg_test.py --data "/home/bs_soft/admin-server/public/upload/${Name}" `, function(error, stdout, stderr){
            if(error) {
            console.error('error: ' + error);
            return;
            }else{
                console.log("图片处理完成");
            }
        })
    }
    let url = await formImage()
    await pythonImage(nickName)
    try{
        let { rows: result } = await query(`insert into results(id, in_file, checkTime) values( '${id}','${nickName}', '${checkTime}')`);
        ctx.body = {
            status: 200,
            message: '收到上传图片',
            name: nickName
        };
    }catch (err){
        console.log(err);
        ctx.body = {
            status: 400,
            message: '上传图片失败'
        };
    }
});
//加载用户信息
router.post('/api/info', async ctx => {
    let { id } = ctx.request.body;
    let { rows: result } = await query(`select name, sex, age, nation, marriage, profession, birthday, inTime, tel, history from user_info where id='${id}' limit 1`);
    console.log(result)
    if(result[0]){
        ctx.body = {
            status: 200,
            message: '用户信息查询成功',
            name: result[0].name,
            sex: result[0].sex,
            age: result[0].age,
            nation: result[0].nation,
            marriage: result[0].marriage,
            profession: result[0].profession,
            birthday: result[0].birthday,
            inTime: result[0].inTime,
            tel: result[0].tel,
            history: result[0].history
        }
    }else {
        ctx.body = {
            status: 400,
            message: '数据库查询不到'
        }
    }
});
//搜索用户信息
router.post('/api/getInfo', async ctx => {
    let { nickname } = ctx.request.body;
    try{
        let { rows: result } = await query(`select id, name, sex, age, tel, inTime, history from user_info where name like '%${nickname}%' `);
        console.log(result)
        ctx.body = {
            status: 200,
            message: '用户信息查询成功',
            info: result
        }
    }catch (err){
        console.log(err)
        ctx.body = {
            status: 400,
            message: '用户信息查询失败'
        }
    }

});
//用户资料更新
router.post('/api/update', async ctx => {
    let { id, name, sex, age, nation, marriage, profession, birthday, tel, history} = ctx.request.body;
    try{
        let { rows: result } = await query(`update user_info set name='${name}', sex='${sex}', age=${age}, nation='${nation}', marriage='${marriage}', profession='${profession}', birthday='${birthday}',  tel='${tel}', history='${history}' where id='${id}' `);
        console.log(result)
        ctx.body = {
            status: 200,
            message: '用户信息保存成功',
        }
    }catch (err){
        console.log(err)
        ctx.body = {
            status: 400,
            message: '用户信息保存失败'
        }
    }
});
//查询诊断内容
router.post('/api/getContents', async ctx => {
    let { id } = ctx.request.body;
    try{
        let { rows: result } = await query(`select checkTime, in_file, contents, suggestion  from results where id='${id}' `);
        console.log(result)
        ctx.body = {
            status: 200,
            result: result,
            message: '诊断内容查询成功',
        }
    }catch (err){
        console.log(err)
        ctx.body = {
            status: 400,
            message: '诊断内容查询失败'
        }
    }
});
//通过图片名查询诊断内容
router.post('/api/getContentsByPhoto', async ctx => {
    let { photoname } = ctx.request.body;
    try{
        let { rows: result } = await query(`select  checkTime, in_file, contents, suggestion  from results where in_file='${photoname}' limit 1`);
        console.log(result)
        ctx.body = {
            status: 200,
            result: result,
            message: '诊断内容查询成功',
        }
    }catch (err){
        console.log(err)
        ctx.body = {
            status: 400,
            message: '诊断内容查询失败'
        }
    }
});
//增加诊断内容
router.post('/api/addContents', async ctx => {
    let { id, checkTime, contents, suggestion } = ctx.request.body;
    try{
        let { rows: result } = await query(`insert into contents values('${id}', '${checkTime}', '${contents}', '${suggestion}')`);
        console.log(result)
        ctx.body = {
            status: 200,
            result: result,
            message: '诊断内容插入成功',
        }
    }catch (err){
        console.log(err)
        ctx.body = {
            status: 400,
            message: '诊断内容插入失败'
        }
    }
});
//修改诊断内容
router.post('/api/updateContents', async ctx => {
    let { in_file,  contents, suggestion} = ctx.request.body;
    try{
        let { rows: result } = await query(`update results set contents='${contents}', suggestion='${suggestion}'  where in_file='${in_file}'`);
        console.log(result)
        ctx.body = {
            status: 200,
            message: '诊断内容修改成功',
        }
    }catch (err){
        console.log(err)
        ctx.body = {
            status: 400,
            message: '诊断内容修改失败'
        }
    }
});
//初始化用户照片
router.post('/api/firstFind', async ctx => {
    let { id } = ctx.request.body;
    console.log(`id: ${id}`)
    try{
        let { rows: result } = await query(`select in_file from results where id='${id}'`);
        console.log(result)
        ctx.body = {
            status: 200,
            message: '用户图片初始化成功',
            name: result
        }
    }catch (err){
        console.log(err)
        ctx.body = {
            status: 400,
            message: '用户图片初始化失败'
        }
    }
});

//查询用户图片
router.post('/api/find', async ctx => {
    let { nickname } = ctx.request.body;
    try{
        let { rows: result } = await query(`select in_file from results where in_file like '%${nickname}%'`);
        console.log(result)
        ctx.body = {
            status: 200,
            message: '用户图片查询成功',
            name: result
        }
    }catch (err){
        console.log(err)
        ctx.body = {
            status: 400,
            message: '用户图片查询失败'
        }
    }
});

//删除用户照片
router.post('/api/del', async ctx => {
    let { photoname } = ctx.request.body;
    try{
        let { rows: result } = await query(`delete from results where in_file='${photoname}'`);
        console.log(result)
        let path = [`/home/bs_soft/admin-server/public/upload/${photoname}`, 
                    `/home/bs_soft/admin-server/public/output/segm/${photoname}`, 
                    `/home/bs_soft/admin-server/public/output/visualize/${photoname}` ];
        for(let i = 0; i < 3; i++){
            fs.unlink(path[i],function(error){
            if(error){
                console.log(error);
                return false;
                }
            
            })
        }
        console.log('删除文件成功');
        ctx.body = {
            status: 200,
            message: '用户图片删除成功',
        }
    }catch (err){
        console.log(err)
        ctx.body = {
            status: 400,
            message: '用户图片删除失败'
        }
    }
});
//通过图片搜索id
router.post('/api/findID', async ctx => {
    let { photoname } = ctx.request.body;
    try{
        let { rows: result } = await query(`select id from results where in_file='${photoname}' limit 1`);
        console.log(result)
        ctx.body = {
            status: 200,
            message: '用户id查询成功',
            id: result[0].id
        }
    }catch (err){
        console.log(err)
        ctx.body = {
            status: 400,
            message: '用户id查询失败'
        }
    }
});
export default router