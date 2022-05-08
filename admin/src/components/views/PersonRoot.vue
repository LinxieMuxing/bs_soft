<template>
  <!--悬浮框-->
  <Result v-model="logvisible" :ID="id" :choose="choose" @closedia="closedia"></Result>
  <!--搜索栏-->
  <el-row :gutter="20" @keyup.enter="getUserInfo">
    <el-input v-model="input" placeholder="请输入查询姓名">
      <template #append>
        <el-button @click="getUserInfo"><el-icon><search /></el-icon></el-button>
      </template>
    </el-input>
  </el-row>
  <el-divider />
  <!--用户信息-->
  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="inTime" label="诊断时间" width="150" />
    <el-table-column prop="name" label="名字" width="120" />
    <el-table-column prop="sex" label="性别" width="120" />
    <el-table-column prop="age" label="年龄" width="120" />
    <el-table-column prop="tel" label="联系方式" width="120" />
    <el-table-column prop="history" label="既往病史" width="150"/>
    <el-table-column fixed="right" label="诊断结果" width="120">
    <template #default="scope">
        <el-button type="text"  @click="handleClick(scope.$index)">详情</el-button>
    </template>
    </el-table-column>
  </el-table>

</template>

<script>
import { ElMessage } from 'element-plus'
import Result from "./Result.vue";
export default {
  name: "PersonRoot",
  data(){
    return{
      input: '',//搜索框内容
      tableData:[],//表格内容
      logvisible: false,//悬浮窗的显示判断
      id: '',//传到Result中的参数
      choose: 'id',//选择
    }
  },
  components: {
      Result,
  },
  methods:{
    closedia(){//悬浮窗关闭的触发事件
      this.logvisible = false;
    },
    async getUserInfo(){//通过输入框内容获取用户信息
      let {data: res} = await this.$http({
        url: '/api/getInfo',
        method: 'post',
        data: {
          nickname: this.input
        }
      })
      console.log(res)
      let temp_arr = []
      for(let i = 0; i < res.info.length; i++){
        let temp = {
          id: res.info[i].id,
          inTime: res.info[i].inTime,
          name: res.info[i].name,
          sex: res.info[i].sex,
          tel: res.info[i].tel,
          age: res.info[i].age,
          history: res.info[i].history,
        }
        temp_arr.push(temp)
      }
      this.tableData = temp_arr
    },
    handleClick(index){
        if(this.tableData[index].id === 'admin'){
            ElMessage.error('管理员账户！')
            return;
        }
        this.logvisible = true;
        this.id = this.tableData[index].id;
    },
  },
  async mounted() {//挂载时 初始化用户信息
    let {data: res} = await this.$http({
      url: '/api/getInfo',
      method: 'post',
      data: {
        nickname: ''
      }
    })
    console.log(res)
    let temp_arr = []
    for(let i = 0; i < res.info.length; i++){
      let temp = {
        id: res.info[i].id,
        inTime: res.info[i].inTime,
        name: res.info[i].name,
        sex: res.info[i].sex,
        tel: res.info[i].tel,
        age: res.info[i].age,
        history: res.info[i].history,
      }
      temp_arr.push(temp)
    }
    this.tableData = temp_arr
  },
}
</script>

<style scoped>

</style>