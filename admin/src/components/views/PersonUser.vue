<template>
  <el-form label-width="120px">
      
    <el-form-item label="姓名:" >
      <el-input v-model="name" style="width: 30%" />
    </el-form-item>

    <el-form-item label="性别：" >
      <el-select v-model="sex">
        <el-option label="男" value="男"/>
        <el-option label="女" value="女"/>
      </el-select>
    </el-form-item>

    <el-form-item label="年龄:">
    <el-input-number
        v-model="age"
        :min="0"
        :max="100"
        size="small"
        :disabled="true"
        :controls="false"
    />
    </el-form-item>

    <el-form-item label="民族:" >
      <el-select v-model="nation">
        <el-option v-for="(item) in mz" :label="item" :value="item" :key="item.id"/>
      </el-select>
    </el-form-item>

    <el-form-item label="婚姻:" >
      <el-select v-model="marriage">
        <el-option label="未婚" value="未婚"/>
        <el-option label="已婚" value="已婚"/>
        <el-option label="离异" value="离异"/>
      </el-select>
    </el-form-item>

    <el-form-item label="职业:" >
      <el-input v-model="profession" style="width: 30%"/>
    </el-form-item>

    <el-form-item label="出生日期:">
        <el-date-picker
            type="date"
            placeholder="选择一个日期"
            style="width: auto"
            v-model="birthday"
            @change="birChange"
            value-format="YYYY-MM-DD"
        />
    </el-form-item>

    <el-form-item label="联系方式:" >
      <el-input
          v-model="tel"
          maxlength="11"
          minlength="11"
          type="tel"
          style="width: auto"
      />
    </el-form-item>

    <el-form-item label="就诊时间:">
      <el-date-picker
          type="date"
          placeholder="选择一个日期"
          style="width: auto"
          v-model="inTime"
          value-format="YYYY-MM-DD"
          :disabled="true"
      />
    </el-form-item>
    <el-form-item label="既往病史:">
      <el-input type="textarea" v-model="history"/>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="onSubmit">保存</el-button>
    </el-form-item>

  </el-form>
</template>


<script>
import {ElMessage} from "element-plus";

export default {
  name: "PersonUser",
   setup() {
    return {

    }
  },
  data() {
    return {
      name: '',
      sex: '男',
      age: 0,
      nation: '汉族',
      marriage: '未婚',
      profession: '',
      birthday: '',
      inTime: '',
      tel: '',
      history: '',
      mz: ['汉族','蒙古族','回族','藏族','苗族','维吾尔族','彝族','壮族','布依族',

            '白族','朝鲜族','侗族','哈尼族','哈萨克族','满族','土家族','瑶族',

            '达斡尔族','东乡族','高山族','景颇族','柯尔克孜族','拉祜族','纳西族','畲族',

            '傣族','黎族','傈僳族','仫佬族','羌族','水族','土族','佤族',

            '阿昌族','布朗族','毛南族','普米族','撒拉族','塔吉克族','锡伯族','仡佬族',

            '保安族','德昂族','俄罗斯族','鄂温克族','京族','怒族','乌孜别克族','裕固族',

            '独龙族','鄂伦春族','赫哲族','基诺族','珞巴族','门巴族','塔塔尔族'],
    }
  },
  mounted() {
    this.getInfo();
  },
  methods: {
    birChange(){//生日-年龄双向绑定
      let birthdays = new Date(this.birthday.toString().replace(/-/g,"/"))
      let d = new Date()
      let age = d.getFullYear() -
          birthdays.getFullYear() -
          (d.getMonth() < birthdays.getMonth() ||
          (d.getMonth() == birthdays.getMonth() &&
              d.getDate() < birthdays.getDate())
              ? 1
              : 0);
      this.age = age
    },
    async getInfo() {//获取用户信息
      let {data: res} =  await this.$http({
        url: '/api/info',
        method: 'post',
        data: {
          id: sessionStorage.getItem('id')
        }
      })
      console.log(res)
      if(res.status === 200 ) {
        this.name = res.name
        this.sex = res.sex
        this.age = res.age
        this.nation = res.nation
        this.marriage = res.marriage
        this.profession = res.profession
        this.birthday = res.birthday
        this.inTime = res.inTime
        this.tel = res.tel
        this.history = res.history
      }
    },
    async onSubmit() {//保存用户信息
      let {data: res} =  await this.$http({
        url: '/api/update',
        method: 'post',
        data: {
          id: sessionStorage.getItem('id'),
          name: this.name,
          sex: this.sex,
          age: this.age ,
          nation: this.nation ,
          marriage: this.marriage ,
          profession: this.profession ,
          birthday: this.birthday ,
          tel: this.tel ,
          history: this.history ,
        }
      })
      console.log(res)
      if(res.status === 200){
        ElMessage.success('保存成功！')
      }else {
        ElMessage.error('保存失败！')
      }
    }
  },
}
</script>

<style scoped>

</style>