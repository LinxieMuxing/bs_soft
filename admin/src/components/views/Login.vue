<!--登录界面-->
<template>
  <el-container>
    <el-header>息肉检测 管理系统</el-header>
    <el-main>
      <div class="login-container">
        <div class="login-box">
          <!-- 头像区域 -->
          <div class="avatar-box ">
            <img src="../../assets/logo1.jpg" class="img-thumbnail avatar" alt="" />
          </div>
          <!-- 表单区域 -->
          <el-form label-width="0px" class="login_form" @keyup.enter="onLoginClick">
              <!--用户名-->
              <el-form-item>
                <el-input
                    v-model.trim="username"
                    class="w-50 m-2"
                    placeholder="请输入用户名"
                />
              </el-form-item>
              <!--密码-->
              <el-form-item>
                <el-input
                    v-model="password"
                    type="password"
                    class="w-50 m-2"
                    placeholder="请输入密码"
                    show-password
                />
              </el-form-item>
              <!-- 登录和注册按钮 -->
              <el-row justify="end">
                <el-form-item>
                <el-button type="primary" @click="onLoginClick">登录</el-button>
                <el-button type="success" @click="onLogonClick">注册</el-button>
                </el-form-item>
              </el-row>
          </el-form>
        </div>
      </div>
    </el-main>

  </el-container>
</template>

<script>
import { ElMessage } from 'element-plus'

export default {
  name: 'Login',
  data() {
    return {
      username : '',
      password : '',
    }
  },
  props: {

  },
  methods: {
    async onLoginClick() {//登录按钮
      let {data: res} = await this.$http({
        url: '/api/login',
        method: 'post',
        data: {
          username: this.username,
          password: this.password,
        }
      })
      console.log(res)
      if(res.status === 200 ){
        console.log('登录成功！')
        sessionStorage.setItem('token', res.token)
        sessionStorage.setItem('nickname', res.name)
        sessionStorage.setItem('id', res.id)
        sessionStorage.setItem('identity', res.identity)
        await this.$router.push('/home')
      }else {
        ElMessage.error('登录失败！')
      }
    },
    async onLogonClick() {//注册按钮
        await this.$router.push('/logon')
    }
  }
}
</script>

<style lang="less" scoped>

.login-container {
  background-color: #35495e;
  height: 100%;
  .login-box {
    width: 400px;
    height: 250px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.5);
    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
    }
  }
}

.avatar-box {
  position: absolute;
  width: 100%;
  top: -65px;
  left: 0;
  .avatar {
    width: 120px;
    height: 120px;
    border-radius: 50% !important;
    box-shadow: 0 0 6px #efefef;
  }
}
</style>
