import mysql from 'mysql'
import { CONNECTION_POOL } from './config.mjs'

const pool = mysql.createPool(CONNECTION_POOL);
//数据库操作
let query = function (sql, values) {
    return new Promise(function (reslove, reject) {
        pool.getConnection(function (err, connection) {
            // 使用连接
            if (err) {
                reject(err);
            }else{ 
                connection.query(sql, values, function (err, rows, fields) {
                    // 使用连接执行查询
                    if (err) {
                        reject(err);
                    }
                    connection.release();
                    reslove({ err, rows, fields })
                    //连接不再使用，返回到连接池
                });
            }
        });
    });
}
export default query