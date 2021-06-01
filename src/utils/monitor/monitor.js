/**
 * 结合监控sdk 封装监控库
 * 有哪些需要错误监控和性能收集
 * 是下一步做性能分析的前提
 * 1. window的unhandledrejection方法,截获未处理reject,业务在catch中手动上报
 * 2. 绑定静态资源加载错误
 * 3. 框架错误处理errorHandler（可以是js或者组件本身） 比如 vue
 * 4. 跨域资源
 * 5. 接口请求异常，这个整合到请求库
 */


 /**
  * @description 监控构造类
  * @param {object} owl 有sdk加载
  * @param {object} global 有浏览器环境
  */
 export function Monitor(owl = window.Owl, global = window) {
  this.global = global
  this.owl = owl
  this.isConsole = true
 }

 /**
 * @description: 是否console输出
 * @param {bool} isConsole
 * @return {bool}
 */
Monitor.prototype.setConsole = function(isConsole = true) {
  this.isConsole = isConsole
  return true
}

/**
 * @description: 检查owl是否就绪，一般sdk的顶层对象都要预先判断，也可以返回promise
 * @return {bool}
 */
Monitor.prototype.ready = function() {
  return (
    this.owl &&
    hasOwnPropertys(this.owl, [
      'addPoint',
      'addError',
      'metricManager',
      'addApi',
      'config',
      'setDimension'
    ])
  )
}

/**
 * @description: 检查对象属性是否都存在
 * @param {object} obj - 被检查对象
 * @param {array} keys - 检查对象属性数组
 * @return {bool}
 */
function hasOwnPropertys(obj = {}, keys = []) {
  return !keys.some(
    key => !(Object.prototype.hasOwnProperty.call(obj, key) || obj[key])
  )
}