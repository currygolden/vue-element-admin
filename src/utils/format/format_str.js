/**
 * 字符串中变量替换，在字符串中写占位符 {xxx} 即可
 * @param {String, Array, Object} originData 原始数据，即需要格式化的数据，支持数组、对象、字符串
 * @param {Object} obj 替换的值，例如传入{ time: 10, money: 20 }，可以将原始数据中 {time} 替换为 10，将原始数据中 {money} 替换为 20
 * @return {String, Array, Object} 返回值，即处理过的数据
 */

export default function formatString(originData, obj = {}) {
  const isObj = Object.prototype.toString.call(originData) === '[object Object]'
  const isArr = Object.prototype.toString.call(originData) === '[object Array]'
  const isStr = Object.prototype.toString.call(originData) === '[object String]'
  const keys = Object.keys(obj)
  if (isStr) {
    keys &&
      keys.length &&
      keys.forEach(key => {
        originData = originData.replace(new RegExp(`{${key}}`, 'g'), obj[key])
      })
    return originData
  } else if (isObj) {
    const object = {}
    const originDataKeys = Object.keys(originData)
    originDataKeys &&
      originDataKeys.length &&
      originDataKeys.forEach(item => {
        keys &&
          keys.length &&
          keys.forEach(key => {
            originData[item] = originData[item].replace(
              new RegExp(`{${key}}`, 'g'),
              obj[key]
            )
          })
        object[item] = originData[item]
      })
    return object
  } else if (isArr) {
    const array = []
    originData &&
      originData.length &&
      originData.forEach((item, index) => {
        keys &&
          keys.length &&
          keys.forEach(key => {
            item = item.replace(new RegExp(`{${key}}`, 'g'), obj[key])
          })
        array[index] = item
      })
    return array
  } else {
    return originData
  }
}
