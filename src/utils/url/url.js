/*
 * @Author: 
 * @Date: 2021-01-19 16:50:24
 * @LastEditTime: 2021-02-25 17:48:03
 * @LastEditors: Please set LastEditors
 * @Description: url链接操作库
 * @FilePath: relative path
 */


 /**
  * @description: 将url转化成url对象
  * @param {string} url 
  * @return {object} 包含各种url属性的对象
  */
 export function parse(url) {
  var a = document.createElement('a')
  a.href = url
  // url参数来从windo.location 可知
  let urlObject = {
    source: url,
    protocol: a.protocol.replace(':', ''), // http | https
    host: a.hostname,
    port: a.port,
    query: a.search,
    params: (function() {
      var ret = {},
        seg = a.search.replace(/^\?/, '').split('&'),
        len = seg.length,
        i = 0,
        s
      for (; i < len; i++) {
        if (!seg[i]) {
          continue
        }
        s = seg[i].split('=')
        ret[s[0]] = decodeURIComponent(s[1])
      }
      return ret
    })(),
    file: (a.pathname.match(/\/([^/?#]+)$/i) || ['', ''])[1],
    hash: a.hash.replace('#', ''),
    path: a.pathname.replace(/^([^/])/, '/$1'),
    relative: (a.href.match(/tps?:\/\/[^/]+(.+)/) || ['', ''])[1],
    segments: a.pathname.replace(/^\//, '').split('/')
  }
  return urlObject
 }

 /**
 * @description: 将url对象转化为url字符串
 * @param {object} urlOpt
 * @return {string}
 */
export function stringify(urlOpt) {
  const protocol = urlOpt.protocol ? `${urlOpt.protocol}:` : ''
  const host = `${urlOpt.host || location.hostname || ''}${
    urlOpt.port ? `:${urlOpt.port}` : ''
  }`
  const path = urlOpt.path || ''
  const query = Object.keys(urlOpt.params)
    .reduce((reducer, key) => {
      reducer.push(`${key}=${encodeURIComponent(urlOpt.params[key])}`)
      return reducer
    }, [])
    .join('&')
  const hash = urlOpt.hash || ''
  return `${protocol}//${host}${path}${query.length > 0 ? `?${query}` : ''}${
    hash.length > 0 ? `#${hash}` : ''
  }`
}