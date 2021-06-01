import { stringify } from 'src/utils/url'

/**
 * @description 脚本加载函数 同步|延迟脚本|异步脚本
 * @param {object} config
 * @return {promise}
 * 用ts改造
*/
export function loadScript(config) {
  const defaultconfig = {
    type: '', // 脚本类型 
    src: '' // 链接
  }
  const tmpObj = Object.assign({}, defaultconfig, config)
  return new Promise((resolve, reject) => {
    let script = document.createElement('script')
    script.type = 'text/javascript'
    script.onload = function() {
      resolve()
    }
    script.onerror = function() {
      reject(new Error(`Failed to load ${tmpObj.src}`))
    }
    script.src = tmpObj.src
    // 添加异步属性
    tmpObj.type && script.setAttribute(tmpObj.type, tmpObj.type)
    // 插入位置 head
    document.getElementsByTagName('head')[0].appendChild(script)
    // body最后
    // document.body.appendChild(script)
  })
}

/**
 * @description jsonp 加载脚本，考虑以下几点
 * 1 cb 需要挂在window，所以存在多个调用场景需要控制唯一
 * 2 合理的gc策略
 * 3 支持promise
 * 4 错误收集
 * 5 脚本加载顺序
 * @param {string} url 协议链接
 * @param {object} data 协议参数
 * @param {function} cb 协议回调
 * @return {*}
*/
export function jsonpFuc(url, data, cb) {
  const fnName = `jsonp_${new Date().getTime()}`
  const script = document.createElement('script')
  const container = document.getElementsByTagName('head')[0]
  script.src = `${url}?${stringify(data)}&callback=${fnName}`
  script.type = 'text/javascript'
  container.appendChild(script)

  script.onload = function(res) {
    window[fnName] = function() {
      cb && cb(res)
      container.removeChild(script)
      delete window[fnName]
    }
  }
  script.onerror = function() {
    window[fnName] = function() {
      cb && cb(new Error('加载错误'))
      container.removeChild(script)
      delete window[fnName]
    }
  }
}
