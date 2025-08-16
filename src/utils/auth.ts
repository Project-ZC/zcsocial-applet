import { uniCache } from "@/utils/storage";
const TOKEN_KEY = 'token'

// 存储Token
export function setToken(token) {
    uniCache.setItem(TOKEN_KEY, token)
}

// 获取Token
export function getToken() {
    return uniCache.getItem(TOKEN_KEY)
}

// 清除Token
export function clearToken() {
    uniCache.removeItem(TOKEN_KEY)
}