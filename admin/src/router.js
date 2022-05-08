import { createRouter,createMemoryHistory } from "vue-router";
import Login from './components/views/Login.vue'
import Home from './components/views/Home.vue'
import Logon from './components/views/Logon.vue'

//前端路由具体
const router = createRouter({
    history: createMemoryHistory(),
    routes: [
        //路由重定向
        {path: '/', redirect: '/home'},
        {path: '/login', component: Login},
        {path: '/home', component: Home, meta: {keepAlive: true} },
        {path: '/logon', component: Logon}
    ]
})
//通过jwt判断用户登录状态 路由守卫
router.beforeEach((to, from, next) => {
    // 判断用户访问的是否为登录页或注册页
    if (to.path === '/login' || to.path === '/logon') return next()
    // 获取 token 值
    const tokenStr = sessionStorage.getItem('token')
    if (!tokenStr) {
        next('/login')
    } else {
        next()
    }
})


export default router