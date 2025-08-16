<script setup lang="ts">
import { onHide, onLaunch, onShow } from "@dcloudio/uni-app";
import { useUserStore }  from "@/stores/index";
import { setOnAuthErrorCallback } from "@/utils/http";
import { uniCache } from "@/utils/storage";

const userStore = useUserStore();

onLaunch(() => {
  // if (!userStore.userInfo?.token) {
  //   userStore.login();
  // }
  // 设置登录过期错误处理回调
  setOnAuthErrorCallback(async (error) => {
    console.log('登录过期，尝试重新登录:', error);
    await userStore.login();
  });
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
  