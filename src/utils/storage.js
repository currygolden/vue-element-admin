/* 基于localstorage的本地存储，缓存
  1. 对比vuex，localstorage的记录状态有差异，前者是保存在内存中，同步状态，共享状态，更多的意义是存储
  2. 明确缓存层的意义，以及哪些数据适合作为缓存
  3. 缓存主要指接口层面，用于前后端分层设计，和数据存储还是有差异
  4. 明确是使用缓存要慎重，避免问题回滚难定位
*/

function Storage(namespace) {
  this.namespace = namespace || ''
}

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

Storage.prototype.isOutSpace = function(error) {
  return (
    error &&
    (error.name === 'QUOTA_EXCEEDED_ERR' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.name === 'QuotaExceededError')
  )
}

Storage.prototype.setExpiration = function(context, expirationTime) {
  const current = new Date().getTime()
  context.expiration =
    expirationTime > current ? expirationTime : current + expirationTime
  return context
}

Storage.prototype.isExpration = function(expirationTime) {
  return new Date().getTime() > expirationTime
}

Storage.prototype.getKey = function(key) {
  return `${this.namespace}-${key}`
}

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

Storage.prototype.clear = function() {
  if (!this.isSupport()) {
    return undefined
  }
  this.eachKey(key => {
    localStorage.removeItem(key)
  })
}

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

export default Storage
