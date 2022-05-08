<!--主界面-->
<template>
  <div class="common-layout">
    <el-container>
      <!--侧边部分-->
      <el-aside width="200px">
        <el-menu
            default-active="1"
            class="el-menu-vertical-demo"
            :collapse="isCollapse"
            @mousemove="isCollapse=false"
            @mouseleave="isCollapse=true"
        >
          <el-menu-item @click="comName='Source'" index="1">
            <el-icon><histogram /></el-icon>
            <template #title>首页</template>
          </el-menu-item>
          <el-menu-item @click="comName='CT'" index="2">
            <el-icon><home-filled /></el-icon>
            <template #title>CT检测</template>
          </el-menu-item>
          <el-menu-item @click="comName='Person'" index="3">
            <el-icon><avatar /></el-icon>
            <template #title>病人管理</template>
          </el-menu-item>
          <el-menu-item @click="logout" index="4" >
            <el-icon><circle-close-filled /></el-icon>
            <template #title>退出登录</template>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <!--主体部分-->
      <el-main>
        <keep-alive>
            <component :is="comName" ></component>
        </keep-alive>
      </el-main>

    </el-container>
  </div>
</template>

<script>
import Source from "./Source.vue"
import CT from "./CT.vue"
import Person from "./Person.vue"

export default {
  name: "Home",
  setup(){
    return {

    }
  },
  data() {
    return{
      isCollapse: true,//是否收缩
      comName: 'Source',//右边显示的组件
      Uname: '',//用户名（未使用）
    }
  },
  methods: {
    logout() {//退出按钮
      sessionStorage.clear()
      this.$router.push('/login')
    }
  },
  components: {
    Source,
    CT,
    Person
  }
}
</script>

<style lang="less" scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>