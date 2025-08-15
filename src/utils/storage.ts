const storagePrefix = '';
const storageIgnores = [];

class MyCache {
    // storage: Storage;
    constructor(isLocal = true) {
        // this.storage = uni.getStorageSync;
    }
    setItem(key, value) {
        if (typeof value === 'object') value = JSON.stringify(value);
        const keyName = storageIgnores.includes(key) ? key : `${storagePrefix}${key}`;
        uni.setStorageSync(keyName, value);
    }

    getItem(key) {
        const keyName = storageIgnores.includes(key) ? key : `${storagePrefix}${key}`;
        try {
            return JSON.parse(uni.getStorageSync(keyName));
        } catch (err) {
            return uni.getStorageSync(keyName);
        }
    }

    removeItem(key) {
        const keyName = storageIgnores.includes(key) ? key : `${storagePrefix}${key}`;
        uni.removeStorageSync(keyName);
    }

    clear() {
        uni.clearStorageSync();
    }

    key(index) {
        return uni.getStorageInfoSync().keys[index];
    }

    length() {
        return uni.getStorageInfoSync().keys.length;
    }
}

const uniCache = new MyCache();

export { uniCache };
