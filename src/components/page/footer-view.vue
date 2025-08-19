<template>
    <view class="footer">
        <slot></slot>
    </view>
</template>



<style lang="scss" scoped>
@import "@/uni.scss";
.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: $up-footer-h;
    background-color: #ffffff;
    display: flex;
    // justify-content: space-around;
    align-items: center;
    border-top: 1px solid #eaeaea;
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
    z-index: 99;
}
</style>