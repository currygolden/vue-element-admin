/* method **
 * add / subtract / multiply /divide
 * floatObj.add(0.1, 0.2) >> 0.3
 * floatObj.multiply(19.9, 100) >> 1990
 * 小数运算保留精度
 */
import reportErrorName from 'utils/reportErrorName'
const floatObj = function() {
  /*
   * 判断obj是否为一个整数
   */
  function isInteger(obj) {
    return Math.floor(obj) === obj
  }
  /*
   * 将一个浮点数转成整数，返回整数和倍数。如 3.14 >> 314，倍数是 100
   * @param floatNum {number} 小数
   * @return {object}
   *   {times:100, num: 314}
   */
  function toInteger(floatNum) {
    const ret = { times: 1, num: 0 }
    if (isInteger(floatNum)) {
      ret.num = floatNum
      return ret
    }
    const strfi = floatNum + ''
    const dotPos = strfi.indexOf('.')
    const len = strfi.substr(dotPos + 1).length
    const times = Math.pow(10, len)
    const intNum = Number(floatNum.toString().replace('.', ''))
    ret.times = times
    ret.num = intNum
    return ret
  }

  /*
   * 核心方法，实现加减乘除运算，确保不丢失精度
   * 思路：把小数放大为整数（乘），进行算术运算，再缩小为小数（除）
   *
   * @param a {number} 运算数1
   * @param b {number} 运算数2
   * @param digits {number} 精度，保留的小数点数，比如 2, 即保留为两位小数
   * @param op {string} 运算类型，有加减乘除（add/subtract/multiply/divide）
   *
   */
  function operation(a, b, digits, op) {
    const o1 = toInteger(a)
    const o2 = toInteger(b)
    const n1 = o1.num
    const n2 = o2.num
    const t1 = o1.times
    const t2 = o2.times
    const max = t1 > t2 ? t1 : t2
    let result = null
    let returnResult = null
    switch (op) {
      case 'add':
        if (t1 === t2) {
          // 两个小数位数相同
          result = n1 + n2
        } else if (t1 > t2) {
          // o1 小数位 大于 o2
          result = n1 + n2 * (t1 / t2)
        } else {
          // o1 小数位 小于 o2
          result = n1 * (t2 / t1) + n2
        }
        returnResult = result / max
        break
      case 'subtract':
        if (t1 === t2) {
          result = n1 - n2
        } else if (t1 > t2) {
          result = n1 - n2 * (t1 / t2)
        } else {
          result = n1 * (t2 / t1) - n2
        }
        returnResult = result / max
        break
      case 'multiply':
        result = (n1 * n2) / (t1 * t2)
        returnResult = result
        break
      case 'divide':
        result = (n1 / n2) * (t2 / t1)
        returnResult = result
        break
    }
    return digits ? +returnResult.toFixed(digits) : returnResult
  }

  function checkNumber(a, b) {
    if (
      (+a).toString() === 'NaN' ||
      (+b).toString() === 'NaN' ||
      a === '' ||
      b === ''
    ) {
      if (!window.Owl) return
      window.Owl.addError({
        name: reportErrorName(),
        msg: '加减乘除方法传参错误, a=' + a + ';b=' + b
      })

      return false
    } else {
      return true
    }
  }

  // 加减乘除的四个接口
  function add(a, b, digits) {
    return checkNumber(a, b) && operation(+a, +b, digits, 'add')
  }
  function subtract(a, b, digits) {
    return checkNumber(a, b) && operation(+a, +b, digits, 'subtract')
  }
  function multiply(a, b, digits) {
    return checkNumber(a, b) && operation(+a, +b, digits, 'multiply')
  }
  function divide(a, b, digits) {
    return checkNumber(a, b) && operation(+a, +b, digits, 'divide')
  }
  // exports
  return {
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide
  }
}
export default floatObj
