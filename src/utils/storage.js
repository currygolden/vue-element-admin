/* 基于localstorage的本地存储，缓存
  1. 对比vuex，localstorage的记录状态有差异，前者是保存在内存中，同步状态，共享状态，更多的意义是存储
  2. 明确缓存层的意义，以及哪些数据适合作为缓存
  3. 缓存主要指接口层面，用于前后端分层设计，和数据存储还是有差异
  4. 明确是使用缓存要慎重，避免问题回滚难定位
  5. 也可以借助cookie 库做一些存储，但是目的不一样
*/

// 构造函数，提供命名空间
function Storage(namespace) {
  this.namespace = namespace || ''
}

// 批量执行操作
Storage.prototype.eachKey = function(fn) {
  if (!this.isSupport()) {
    return undefined
  }
  let regExp = new RegExp(`^${this.namespace}-(.*)`)
  for (let i = localStorage.length - 1; i >= 0; --i) {
    let key = localStorage.key(i)
    if (regExp.test(key)) {
      fn(key)
    }
  }
}

// 检测兼容性
Storage.prototype.isSupport = function() {
  try {
    if (localStorage && window.localStorage) {
      return true
    }
  } catch (ex) {
    return false
  }
  return false
}

// 超出存储上限
Storage.prototype.isOutSpace = function(error) {
  return (
    error &&
    (error.name === 'QUOTA_EXCEEDED_ERR' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.name === 'QuotaExceededError')
  )
}

// 定义存储的过期时间
Storage.prototype.setExpiration = function(context, expirationTime) {
  const current = new Date().getTime()
  // expirationTime可能是时间戳/时间段
  context.expiration =
    expirationTime > current ? expirationTime : current + expirationTime
  return context
}

// 检测是否过期
Storage.prototype.isExpration = function(expirationTime) {
  return new Date().getTime() > expirationTime
}

Storage.prototype.getKey = function(key) {
  return `${this.namespace}-${key}`
}

// 获取时判断是否过期
Storage.prototype.getItem = function(key) {
  if (!this.isSupport()) {
    return undefined
  }
  try {
    const value = JSON.parse(localStorage.getItem(this.getKey(key)))
    if (this.isExpration(value.expiration)) {
      this.removeItem(key)
      return undefined
    } else {
      return value.data
    }
  } catch (err) {
    return undefined
  }
}
// 调用api的操作丢在 try-catch 中
function set(key, value, expirationTime) {
  if (!this.isSupport()) {
    return undefined
  }
  try {
    localStorage.setItem(
      this.getKey(key),
      JSON.stringify(
        this.setExpiration(
          { data: value },
          expirationTime || 365 * 24 * 60 * 60 * 1000
        )
      )
    )
  } catch (err) {
    return undefined
  }
  return key
}

// 处理各种边界条件，增强鲁棒性
Storage.prototype.setItem = function(
  key,
  value,
  expirationTime = 365 * 24 * 360 * 1000
) {
  if (!this.isSupport()) {
    return undefined
  }
  this.removeItem(key)
  try {
    return set.call(this, key, value, expirationTime)
  } catch (err) {
    if (this.isOutSpace(err)) {
      this.clearExpired()
      try {
        return set(key, value, expirationTime)
      } catch (err) {
        console.warn('localstorage has been out of space')
      }
    }
    return undefined
  }
}

Storage.prototype.removeItem = function(key) {
  if (!this.isSupport()) {
    return undefined
  }
  localStorage.removeItem(this.getKey(key))
  return key
}

// 清空全部
Storage.prototype.clear = function() {
  if (!this.isSupport()) {
    return undefined
  }
  this.eachKey(key => {
    localStorage.removeItem(key)
  })
}

// 清空已过期
Storage.prototype.clearExpired = function() {
  if (!this.isSupport()) {
    return undefined
  }
  this.eachKey(key => {
    const value = JSON.parse(localStorage.getItem(key))
    if (this.isExpration(value.expiration)) {
      localStorage.removeItem(key)
    }
  })
}

// 对于 spa 是否有必要是单例模式
Storage.getInstance = (function(nameSpace) {
  let instance 
  return function() {
    if (!instance) {
      instance = new Storage(nameSpace)
    } else {
      return instance
    }
  }
})()

// 实例化的时候引入类 new 或者单例
export default Storage
