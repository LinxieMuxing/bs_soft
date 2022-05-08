import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import router from './router.js'
import axios from "axios"
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElIcons from '@element-plus/icons-vue'

const app = createApp(App)
//使用前端路由
app.use(router)
//使用Element Plus组件中的icon（可做按需引入的优化）
app.use(ElementPlus)
for (let iconName in ElIcons) {
    app.component(iconName, ElIcons[iconName])
}
//配置axios的参数
app.config.globalProperties.$http = axios
axios.defaults.baseURL = 'http://106.13.193.78:8000'
axios.defaults.timeout = 5000

app.mount('#app')
