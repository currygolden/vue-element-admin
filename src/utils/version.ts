/*
 * @Author: your name
 * @Date: 2021-03-04 14:21:28
 * @LastEditTime: 2021-03-04 14:22:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /vue-element-admin/packages/utils/src/version.js
 */


/**
 * @description 版本更新比较
 * @param {string} current - 当前版本
 * @param {string} compare - 比较版本
 * @return {number} 1：前者比后者更新；0：版本相等；-1：前者比后者更旧
 * @example
 * let a = isNewer('1.2.3', '1.3.0') -1
 * let b = isNewer('1.3.0', '1.3.0') 0
 * let c = isNewer('1.2.3', '1.2.0') 1
 */

export function isNewer(current: string, compare: string): number {
  const currentArr = current.split('.')
  const compareArr = compare.split('.')

  const arrMaxLength = Math.max(currentArr.length, compareArr.length)
  let tmp1, tmp2
  for (let i = 0; i < arrMaxLength; i++) { 
    tmp1 = +currentArr[i] || 0
    tmp2 = +compareArr[i] || 0
    if (tmp1 > tmp2) {
      return 1
    } else if (tmp1 < tmp2) { 
      return -1
    }
  }
  return 0
}