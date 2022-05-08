<!--CT检测界面-->
<template>
  <!--悬浮窗-->
  <Result v-model="logvisible" :name="fileName" :choose="choose" @closedia="closedia"></Result>
  <!--搜索框-->
  <el-row :gutter="20" v-if="identity==='root'" @keyup.enter="getInfo">
    <el-input v-model="input" placeholder="请输入查询姓名">
    <template #append>
      <el-button @click="getInfo"><el-icon><search /></el-icon></el-button>
    </template>
    </el-input>
  </el-row>
  <!--分割线-->
  <el-divider v-if="identity==='root'"/>
  <!--文件上传-->
  <el-upload
      class="upload-demo"
      ref="upload"
      action="http://106.13.193.78:8000/api/img"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :data="fileData"
      :before-upload="beforeAvatarUpload"
      :on-success="handleSuccess"
      list-type="picture"
      :file-list="fileList"
      :before-remove="beforeRemove"
  >
    <el-button type="primary" v-if="identity==='user'">上传图片</el-button>
    <template #tip v-if="identity==='user'">
      <div class="el-upload__tip" >
        JPG/PNG files with a size less than 2MB
      </div>
    </template>
  </el-upload>
</template>

<script>
import { ElMessage } from 'element-plus'
import Result from "./Result.vue";
import {Search} from "@element-plus/icons-vue";
const formatName = (nameStr) =>{//时间戳转时间
  function timestampToTime(timestamp) {
    let date = new Date(timestamp);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : (date.getMonth()+1)) + '-';
    let D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate())  + ' ';
    let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    let s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return Y+M+D+h+m+s;
  }
  let time = nameStr.split("_")[0]
  let name = nameStr.split("_")[1].split(".")[0]
  let data = timestampToTime(Number(time))
  return data + " " + name;
}

export default {
  name: "CT",
  setup() {
    const beforeAvatarUpload = (rawFile) => {//上传前文件判断
      if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
        ElMessage.error('Avatar picture must be JPG/PNG format!')
        return false
      } else if (rawFile.size / 1024 / 1024 > 2) {
        ElMessage.error('Avatar picture size can not exceed 2MB!')
        return false
      }
      return true
    }
    return {
      beforeAvatarUpload
    }
  },
  data(){
    return {
      fileData: {//post上传文件时的额外参数
        nickname: sessionStorage.getItem('nickname'),
        id: sessionStorage.getItem('id'),
      },
      logvisible: false,//悬浮窗的显示判断
      fileName: '',//悬浮窗的图片名（路径）
      fileList: [],//显示的文件
      id: sessionStorage.getItem('id'),
      identity: sessionStorage.getItem('identity'),//用户的身份认证
      input: '',//搜索框的输入
      choose: 'name',//选择
    }
  },
  methods: {
    closedia(){//悬浮窗关闭的触发事件
      this.logvisible = false
    },
    handlePreview (file)  {//预览事件
      console.log(file)
      this.fileName = file.response.name
      console.log(this.fileName)
      this.logvisible = true
    },
    async handleRemove(uploadFile, uploadFiles) {//移除事件
      console.log(uploadFile, uploadFiles)
      let {data: res} = await this.$http({
        url: '/api/del',
        method: 'post',
        data: {
          photoname: uploadFile.response.name
        }
      })
      console.log(res)
      ElMessage.success('图片删除成功！')
    },
    handleSuccess (res,file) {//文件上传成功事件
      file.name = formatName(res.name)
      console.log(res)
      console.log(file)
    },
    async getInfo(){//搜索
      let {data: res} = await this.$http({
        url: '/api/find',
        method: 'post',
        data: {
          nickname: this.input
        }
      })
      console.log(res)
      let temp_arr = []
      for(let i = 0; i < res.name.length; i++){
        let temp = {
          name: formatName(res.name[i].in_file),
          response:{
            name: res.name[i].in_file,
          },
          url: `http://106.13.193.78:8000/public/upload/${res.name[i].in_file}`
        }
        temp_arr.push(temp)
      }
      this.fileList = temp_arr
    },
    beforeRemove(file, fileList){//删除前操作
        if(this.identity==='root'){
            ElMessage.error('管理员禁止删除照片！')
            return reject()
        }
    },
    async getInfoByID(){
      let {data: res} = await this.$http({
        url: '/api/firstFind',
        method: 'post',
        data: {
            id: sessionStorage.getItem('id'),
        }
        })
        console.log(res)
        let list_t = [];
        for(let i = 0; i < res.name.length; i++){
            let temp = {
                name: formatName(res.name[i].in_file),
                response:{
                name: res.name[i].in_file,
            },
            url: `http://106.13.193.78:8000/public/upload/${res.name[i].in_file}`
        }
        list_t.push(temp);
        this.fileList = list_t;
    }
    },

  },
  components: {
    Search,
    Result
  },
  async mounted() {//加载成功的查询事件
    if(this.identity === 'root'){
        this.getInfo();
    }else if(this.identity === 'user'){
        this.getInfoByID();
    }
    
  },
}
</script>

<style scoped>

</style>