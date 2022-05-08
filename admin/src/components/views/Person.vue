<!--病人信息管理-->
<template>
  <person-root v-if="identity==='root'"></person-root>
  <person-user v-if="identity==='user'"></person-user>
</template>

<script>
import PersonUser from "./PersonUser.vue"
import PersonRoot from "./PersonRoot.vue";
export default {
  name: "Person",
  data() {
    return{
      identity: sessionStorage.getItem('identity'),
    }
  },
  components:{
    PersonRoot,
    PersonUser,
  },
}
</script>

<style scoped>

</style>