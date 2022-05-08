<!--CT图的详情-->
<template>
  <el-dialog
      v-model="dialogflag"
      :close-on-click-modal="false"
      :before-close="logdialogclose"
      :destroy-on-close="true"
      :open-delay="500"
      @open="openDia"
  >
    <el-row :gutter="0">
      <el-col :span="12">
        <div class="block">
        <span class="demonstration">检测前</span>
        <el-image style="width: 100px; height: 100px" :src="url" :preview-src-list="srcList" fit="fill" />
        </div>
      </el-col>
      <el-col :span="12">
         <div class="block">
        <span class="demonstration">检测后</span>
        <el-image style="width: 100px; height: 100px" :src="out_url" :preview-src-list="srcList" fit="fill" />
        </div>
      </el-col>
    </el-row>
    
    <el-select v-model="userInfo.checkTime" class="m-2" size="small" style="width: 100%;" @change="selectChange" >
    <el-option
      v-for="item in resList"
      :key="item.checkTime"
      :label="item.checkTime"
      :value="item.checkTime"
    />
  </el-select>
  
  <el-row :gutter="0">
      <el-col :span="12">
          <span class="demonstrationx">诊断内容:</span>
          <el-input 
            type="textarea"  
            v-model="userInfo.contents"
            resize="none"
            :autosize="{ minRows: 4, maxRows: 4 }"
            :disabled="this.identity==='user'"
            />
      </el-col>
      <el-col :span="12">
          <span class="demonstrationx">治疗意见:</span>
          <el-input 
            type="textarea"  
            v-model="userInfo.suggestion"
            resize="none"
            :autosize="{ minRows: 4, maxRows: 4 }"
            :disabled="this.identity==='user'"
            />
      </el-col>
  </el-row>
  <el-button type="success" @click="clickBtn" v-if="identity==='root'"  >保存</el-button>
  </el-dialog>
</template>
<script>
import { ElMessage } from 'element-plus'

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
  let data = timestampToTime(Number(time))
  return data;
}

export default {
  name: "Result",
  props: {
    dialogflag: Boolean,//是否显示悬浮窗
    name: String,//文件名
    ID: String,//用户id
    choose: String,//选择
  },
  data(){
    return{
        userInfo: {//界面显示的
            in_file: '',//图片路径
            checkTime: '',//检测时间
            contents: '',//诊断内容
            suggestion: '',//治疗意见
        },
        resList: [],
        id: '',
        identity: sessionStorage.getItem('identity'),
        
    }
  },
  computed:{
    url: function () {//url的重组
      return `http://106.13.193.78:8000/public/upload/${this.userInfo.in_file}`;
    },
    out_url: function () {//url的重组
      return `http://106.13.193.78:8000/public/output/visualize/${this.userInfo.in_file}`;
    },
    srcList: function (){
        return [`http://106.13.193.78:8000/public/upload/${this.userInfo.in_file}`, `http://106.13.193.78:8000/public/output/visualize/${this.userInfo.in_file}`];
    }
  },
  emits: ['closedia'],//关闭事件触发点
  methods: {
    logdialogclose() {//关闭事件
      this.$emit('closedia')
    },
    selectChange(val){//选中值改变时
        let index = 0;
        for(let i = 0; i < this.resList.length; i++){
            if(this.resList[i].checkTime === val){
                index = i;
                break;
            }
        }
        this.userInfo = JSON.parse(JSON.stringify(this.resList[index]));
    },
    async findID(){
      let {data: res} = await this.$http({
        url: '/api/findID',
        method: 'post',
        data: {
            photoname: this.name,
            }
        })
    console.log(res);
    this.id = res.id;
    },
    async openDia(){//开启悬浮窗时的事件
    if(this.choose === 'name'){
        this.findID();
        let {data: res} = await this.$http({
            url: '/api/getContentsByPhoto',
            method: 'post',
            data: {
                photoname: this.name,
                }
            })
        console.log(res)
        this.userInfo.checkTime = formatName(res.result[0].checkTime);
        this.userInfo.in_file = res.result[0].in_file;
        this.userInfo.contents = res.result[0].contents;
        this.userInfo.suggestion = res.result[0].suggestion;
    }else{
        this.id = this.ID;
    }
    let {data: res} = await this.$http({
        url: '/api/getContents',
        method: 'post',
        data: {
            id: this.id,
            }
    })
    console.log(res);
    this.resList = res.result;
    for(let i = 0; i < res.result.length; i++){
        this.resList[i].checkTime = formatName(this.resList[i].checkTime);
    }
    if(this.choose === 'id'){
        this.userInfo = JSON.parse(JSON.stringify(this.resList[this.resList.length-1]));
    }
  },
  async clickBtn(){//保存按钮事件
    let {data: res} = await this.$http({
        url: '/api/updateContents',
        method: 'post',
        data: {
            in_file: this.userInfo.in_file,
            contents: this.userInfo.contents,
            suggestion: this.userInfo.suggestion,
            }
        })
    console.log(res)
    if(res.status === 200){
        ElMessage.success('保存成功！')
      }else {
        ElMessage.error('保存失败！')
      }
  },
  },
}
</script>
<style scoped>
  .block {
  padding: 30px 0;
  text-align: center;
  border-right: solid 1px var(--el-border-color);
  display: inline-block;
  width: 20%;
  box-sizing: border-box;
  vertical-align: top;
}
.demonstration {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
.demonstrationx {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  text-align: left;
}
</style>