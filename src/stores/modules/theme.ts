import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDarkMode: false
  }),
  
  actions: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      // 更新页面主题
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      if (currentPage) {
        if (this.isDarkMode) {
          currentPage.$page?.setData({
            darkTheme: true
          })
        } else {
          currentPage.$page?.setData({
            darkTheme: false
          })
        }
      }
    }
  }
}) 