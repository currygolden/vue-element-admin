/**
 * 移动端判断设备
 */

const location = window.location
const navigator = window.navigator
const userAgent = navigator.userAgent.toLowerCase()
var queryData = require('../../../src/utils/query_data').default

function test(needle: RegExp): boolean {
  return needle.test(userAgent)
}

export const isTouch = 'ontouchend' in window
export const isAndroid = test(/android|htc/) || /linux/i.test(navigator.platform + '')
export const isIPad = !isAndroid && test(/ipad/)
export const isIPhone = !isAndroid && test(/ipod|iphone/)
export const isIPhoneX =
  /iphone/gi.test(navigator.userAgent) &&
  ((screen.height === 812 && screen.width === 375) ||
    (screen.width === 414 && screen.height === 896))
export const isIOS = isIPad || isIPhone
export const isWinPhone = test(/windows phone/)
export const isXiaoMi = isAndroid && test(/mi\s+/)
export const isUC = test(/ucbrowser/)
export const isWeixin = test(/micromessenger/)
export const WeixinVersionInfo = userAgent.match(/MicroMessenger\/([\d.]+)/i)
export const WeixinVersion =
  WeixinVersionInfo && WeixinVersionInfo.length === 2
    ? WeixinVersionInfo[1]
    : ''
export const isBaiduBrowser = test(/baidubrowser/)
export const isChrome = test(/Chrome\/([\d.]+)/) || test(/CriOS\/([\d.]+)/)
export const isBaiduBox = test(/baiduboxapp/)
export const isPC = !isAndroid && !isIOS && !isWinPhone
export const isHTC = isAndroid && test(/htc\s+/)
export const isDebug = !!~('' + location.port).indexOf('0')
export const isWeibo = test(/weibo/)
export const isQQ = test(/qq\/\d+(\.\d+){2}/i)

