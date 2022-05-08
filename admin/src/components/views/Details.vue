<!--详情-->
<template>
  <el-dialog
      v-model="dialogflag"
      :close-on-click-modal="false"
      :before-close="logdialogclose"
      :destroy-on-close="true"
      :open-delay="100"
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
    
    <el-select v-model="value" class="m-2" placeholder="Select" size="small" style="width: 100%;">
    <el-option
      v-for="item in dateList"
      :key="item.value"
      :label="item.label"
      :value="item.value"
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
            :disabled="this.identity==='root'"
            />
      </el-col>
      <el-col :span="12">
          <span class="demonstrationx">治疗意见:</span>
          <el-input 
            type="textarea"  
            v-model="userInfo.contents"
            resize="none"
            :autosize="{ minRows: 4, maxRows: 4 }"
            :disabled="this.identity==='root'"
            />
      </el-col>
  </el-row>
    
    <el-button type="success" @click="clickBtn" v-if="identity==='user'" size="small" >保存</el-button>        
        
  </el-dialog>
</template>
<script>
import { ElMessage } from 'element-plus'
export default {
  name: "Detials",
  props: {
    dialogflag: Boolean,//是否显示悬浮窗
    name: String,//用户名
  },
  data(){
    return{
        select_array:[],
        userInfo: {
            name: '',//病人名称
            checkTime: '',//检查时间
            contents: '',//诊断内容
            suggestion: '',//治疗意见
        },
        id: '',
        identity: sessionStorage.getItem('identity'),
        
    }
  },
  computed:{
    url: function () {//url的重组
      return `http://106.13.193.78:8000/public/upload/${this.name}`;
    },
    out_url: function () {//url的重组
      return `http://106.13.193.78:8000/public/output/visualize/${this.name}`;
    },
    srcList: function (){
        return [`http://106.13.193.78:8000/public/upload/${this.name}`, `http://106.13.193.78:8000/public/output/visualize/${this.name}`];
    }
  },
  emits: ['closedia'],//关闭事件触发点
  methods: {
    logdialogclose() {//关闭事件
      this.$emit('closedia')
    },
    async openDia(){
    if(this.identity === 'root'){
        let {data: res1} = await this.$http({
        url: '/api/findID',
        method: 'post',
        data: {
            photoname: this.name,
            }
        })
        console.log(res1)
        this.id = res1.id
    }else{
        this.id = sessionStorage.getItem('id')
    }//获得该图对应用户的id
    
    let {data: res2} = await this.$http({
        url: '/api/getContents',
        method: 'post',
        data: {
            id: this.id,
            }
        })
    console.log(res2)
    for(let i = 0; i < res2.length; i++){
        
    }
    
  },
  async clickBtn(){
    let {data: res} = await this.$http({
        url: '/api/updateContents',
        method: 'post',
        data: {
            id: this.id,
            contents: this.userInfo.contents
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