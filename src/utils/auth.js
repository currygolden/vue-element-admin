import Cookies from 'js-cookie'
/* 
  前端缓存库还是有设计空间
  一般需要考虑 命名空间，过期时间，可优化的api结构
*/
const TokenKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
