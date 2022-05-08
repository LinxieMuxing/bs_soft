//数据库连接池配置
export let CONNECTION_POOL={
    connectionLimit: 100,
    host: '106.13.193.78',//云服务器
    user: 'bs',
    password: 'z896583039',
    database: 'bs'
}
export default {
    //jwt秘钥
    SECRET:'thisistheadminofxktplatformsecret',
    //连接池
    CONNECTION_POOL
}