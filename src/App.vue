<script setup lang="ts">
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";
import { useUserStore }  from "@/stores/index";

const userStore = useUserStore();

onLaunch(() => {
  if (!userStore.userInfo?.token) {
    userStore.login();
  }
});

onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script> 

<style lang="scss">
/* 每个页面公共css */
@import 'uview-plus/index.scss';
@import '@/static/styles/common.scss';
</style>
  