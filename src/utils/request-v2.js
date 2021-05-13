import axios from 'axios'
import apiHost from './apiHost'
import { api, apiGateway } from './constant'

// 创建axios实例
const service = axios.create({
  baseURL: '',
  timeout: 300000,
  xsrfCookieName: 'csrfToken',
  xsrfHeaderName: 'X-CSRF-TOKEN',
  withCredentials: true,
  headers: {
    'Accept-Language': 'zh-CN'
  },
  validateStatus: function(status) {
    // default status >= 200 && status < 300
    return (status >= 200 && status < 300) || status === 401
  }
})

// request拦截器
service.interceptors.request.use(
  config => {
    // 同时包含query和body的请求
    if (config.url.indexOf('/') > -1) {
      return config
    } else {
      config.url = api[config.url]
      return config
    }
  },
  error => {
    return Promise.reject(error)
  }
)

// response拦截器
service.interceptors.response.use(
  response => {
    // 兼容 blob 数据请求
    if (
      response.config &&
      response.config.responseType === 'blob' &&
      response.data &&
      response.data.size
    ) {
      // 处理无权限或者报错情况
      if (response.data.type === 'application/json') {
        return new Promise(function(resolve, reject) {
          const reader = new FileReader()
          reader.onload = event => {
            const result = JSON.parse(event.target.result) || {}
            const errInfo = {
              errMsg: result.message || '网络错误，请重试，或联系管理员'
            }
            reject(errInfo)
          }
          reader.readAsText(response.data)
        })
      } else {
        return response
      }
    }

    const data = response.data
    const status = +data.status
    // shepherd错误码：https://km.sankuai.com/page/403278466
    const code = +data.code
    // http status code === 200
    if (
      status === 401 &&
      (data.error === 'Unauthorized' || (data.message || '').indexOf('权限') > -1)
    ) {
      const errInfo = {
        errMsg: `该功能无权限 ${data.path}`,
        message: `该功能无权限 ${data.path}`,
        data: data
      }
      return Promise.reject(errInfo)
    } else if (status === 401 || code === 50102) {
      // 登录
      const params = [
        `successCallbackUrl=${encodeURIComponent(location.href)}`,
        `failCallbackUrl=${encodeURIComponent(location.origin)}/ops/login-error`
      ]
      const errInfo = {
        errMsg: '登录状态失效，跳转中……',
        data: data
      }
      setTimeout(() => {
        window.location.href = `${apiHost}${apiGateway}/weblogin/ssoLogin?${params.join('&')}`
      }, 50)
      return Promise.reject(errInfo)
    } else if (status === 402) {
      // 退出登录
      const errInfo = {
        errMsg: '退出成功，跳转中……',
        data: data
      }
      setTimeout(() => {
        window.location.href = `${apiHost}${apiGateway}${data.data}`
      }, 50)
      return Promise.reject(errInfo)
    } else if (status === 1 || status === 1000 || code === 0) {
      // 成功 hris需兼容code为0
      return response
    } else {
      const errInfo = {
        errMsg: data.message || `获取数据失败(${status})`,
        data: data
      }
      return Promise.reject(errInfo)
    }
  },
  error => {
    const errorJson = JSON.parse(JSON.stringify(error))
    const errRes = errorJson.response
    try {
      window.Owl.addError(
        {
          name: `${errorJson.config && errorJson.config.url}---${error.message}`,
          msg: error.stack
        },
        {
          level: 'warn',
          category: 'ajaxError'
        }
      )
    } catch (e) {
      //
    }
    const errInfo = {
      errMsg: error.message || '未知错误，请重试，或联系管理员',
      message: error.message || '未知错误，请重试，或联系管理员',
      data: errRes && errRes.data ? errRes.data : {}
    }
    return Promise.reject(errInfo)
  }
)

export default service
