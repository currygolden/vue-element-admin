/* 
  表单的校验如何处理的优雅，特别是对于规则一般无规律而且比较个性化的场景


*/

/**
 * 求区间交集
 * @param A Array
 * @param B Array
 */
function intervalIntersection(...arr) {
  if (arr.length < 2) return false
  const checked = [arr[0]]
  const insection = (A, B) => {
    const res = []
    let aIndex = 0
    let bIndex = 0
    while (aIndex < A.length && bIndex < B.length) {
      // A相交/包含于B
      if (A[aIndex][1] >= B[bIndex][0] && A[aIndex][1] <= B[bIndex][1]) {
        res.push([Math.max(A[aIndex][0], B[bIndex][0]), Math.min(A[aIndex][1], B[bIndex][1])])
        aIndex++
        continue
      }
      // B相交/包含于A
      if (B[bIndex][1] >= A[aIndex][0] && B[bIndex][1] <= A[aIndex][1]) {
        res.push([Math.max(A[aIndex][0], B[bIndex][0]), Math.min(A[aIndex][1], B[bIndex][1])])
        bIndex++
        continue
      }
      // A,B相离且A[aIndex]的最大值小于B[bIndex]最小值
      if (A[aIndex][1] < B[bIndex][0]) {
        aIndex++
        continue
      }
      // A,B相离且A[aIndex]的最小值大于B[bIndex]最大值
      if (A[aIndex][0] > B[bIndex][1]) {
        bIndex++
        continue
      }
    }
    return res
  }
  for (let i = 1; i < arr.length; i++) {
    const res = insection([arr[i]], checked)
    if (res.length === 0) {
      checked.push(arr[i])
    } else {
      return true
    }
  }
  return false
}

function getSeconds(time) {
  console.log('time====>', time, typeof time)
  if (!time) return null
  let seconds = 0
  if (typeof time === 'string') {
    const [h, m] = time.split(':')
    seconds = parseInt(h) * 60 + parseInt(m)
  } else {
    seconds = time.getHours() * 60 + time.getMinutes()
  }
  return seconds
}
const amtreg = /^\d+(\.\d{1,2})?$/

function checkPrice(val) {
  return !amtreg.test(val)
}

function checkEmptyOrWrong(data, props) {
  const res = {
    isEmpty: false,
    isPriceWrong: false
  }
  for (const prop of props) {
    const val = data[prop]
    if (val !== 0 && !val) {
      res.isEmpty = true
      return res
    }
    if (prop.toLowerCase().indexOf('price') > -1) {
      console.log('prop---------------val', prop, val, typeof val)
      if (checkPrice(val)) {
        res.isPriceWrong = true
        return res
      }
    }
  }
  return res
}

function basicInsection(data) {
  console.log('ddddata:', data)
  const dataMap = {}
  const res = {
    isInsection: false, // 是否选择重复
    hasDefault: false // 是否有兜底数据
  }
  for (const el of data) {
    const key = el[0].toString()
    if (dataMap[key]) {
      if (dataMap[key].includes(el[1])) {
        res.isInsection = true
      } else {
        dataMap[key].push(el[1])
      }
    } else {
      dataMap[key] = [el[1]]
    }
    if (el[0] === '0' && el[0] === '0') {
      res.hasDefault = true
    }
  }
  return res
}

export function timeCheck(timeData) {
  const msg = []
  const timeProps = ['startTime', 'endTime', 'price']
  if (timeData.length === 0) {
    msg.push('工作时间加价规则未添加，请添加后保存')
    return msg
  }
  const values = []
  for (const ele of timeData) {
    const timeSpan = []
    const res = checkEmptyOrWrong(ele, timeProps)
    if (res.isEmpty) {
      msg.push('加价规则部分时间段不完善，请完善后保存')
      return msg
    }
    if (getSeconds(ele.startTime) > getSeconds(ele.endTime)) {
      msg.push('开始时间不能大于结束时间，请修改后保存')
      return msg
    }
    if (res.isPriceWrong) {
      msg.push('加价规则部分时间段--金额填写错误，请修改后保存')
      return msg
    }
    ele.startTime && timeSpan.push(getSeconds(ele.startTime))
    ele.endTime && timeSpan.push(getSeconds(ele.endTime))
    values.push(timeSpan)
  }
  if (intervalIntersection(...values)) {
    msg.push('多条加价规则时间段重复，请修改后保存')
  }
  return msg
}

export function fenceCheck(data) {
  const msg = []
  if (data.length === 0) {
    msg.push('围栏规则未添加，请添加后保存')
    return msg
  }
  let arr = []
  for (const el of data) {
    console.log('data=======>', data)
    arr = arr.concat(el.list)
    if (!el.list || el.list.length === 0 || (el.price !== 0 && !el.price)) {
      msg.push('围栏规则不完善，请完善后保存')
      return msg
    }
    el.price = el.price.toString()
    if (checkPrice(el.price)) {
      msg.push('围栏规则金额-金额填写错误，请完善后保存')
      return msg
    }
    // if (el.price.indexOf('.') > -1) {
    //   if (el.price.split('.')[1].length > 2) {
    //     msg.push('围栏规则金额-金额填写错误，请完善后保存')
    //     return msg
    //   }
    // }
  }
  const set = new Set(arr)
  if (set.size < arr.length) {
    msg.push('多条加价规则中围栏重复，请修改后保存')
  }
  return msg
}

export function carrierCheck(data) {
  const msg = []
  const carrierProps = ['subVehicleType', 'vehicleType', 'price']

  if (data.length === 0) {
    msg.push('载具规则未添加，请添加后保存')
    return msg
  }
  const arr = []
  for (const el of data) {
    arr.push([el.subVehicleType, el.vehicleType])
    const res = checkEmptyOrWrong(el, carrierProps)
    if (res.isEmpty) {
      msg.push('载具规则不完善，请完善后保存')
      return msg
    }
    if (res.isPriceWrong) {
      msg.push('载具规则金额--金额填写错误，请修改后保存')
      return msg
    }
  }
  const res = basicInsection(arr)
  if (res.isInsection) {
    msg.push('载具规则重复，请修改后保存')
  }
  return msg
}

export function interveneCheck(data) {
  const msg = []

  if (data.length === 0) {
    msg.push('干预规则未添加，请添加后保存')
    return msg
  }
  const arr = []
  for (const el of data) {
    if (!el.list || el.list.length === 0 || (el.price !== 0 && !el.price)) {
      msg.push('干预规则不完善，请完善后保存')
      return msg
    }
    el.price = el.price.toString()
    if (checkPrice(el.price)) {
      msg.push('干预规则金额-金额填写错误，请完善后保存')
      return msg
    }
    for (const listObj of el.list) {
      arr.push(listObj.problemCode)
    }
  }
  console.log('mmmmarr:', arr)
  const set = new Set(arr)
  if (set.size < arr.length) {
    msg.push('您添加的干预类型加价规则重复，请重新添加')
  }
  return msg
}

export function basicCheck(data) {
  const msg = []
  // const props = ['bikeType', 'subBikeType', 'reachPrice', 'noReachPrice']
  if (data.length === 0) {
    msg.push('基础单价未添加，请添加后保存')
    return msg
  }
  const props = data && Object.keys(data[0])
  const arr = []
  for (const el of data) {
    console.log('el:', el)
    arr.push([el.bikeType, el.subBikeType])
    const res = checkEmptyOrWrong(el, props)
    if (res.isEmpty) {
      msg.push('基础单价规则不完善，请完善后保存')
      return msg
    }
    if (res.isPriceWrong) {
      msg.push('基础单价规则金额--金额填写错误，请修改后保存')
      return msg
    }
  }
  console.log('bbbasicArr:', arr)
  const res = basicInsection(arr)
  if (res.isInsection) {
    msg.push('基础定价规则重复，请修改后保存')
  }
  if (!res.hasDefault) {
    msg.push('基础单价规则无兜底数据，请添加后保存')
  }
  return msg
}

export function basicByDayCheck(data) {
  const msg = []
  const props = ['vehicleType', 'subVehicleType', 'price']
  if (data.length === 0) {
    msg.push('基础单价未添加，请添加后保存')
    return msg
  }
  const arr = []
  for (const el of data) {
    arr.push([el.vehicleType, el.subVehicleType])
    const res = checkEmptyOrWrong(el, props)
    if (res.isEmpty) {
      msg.push('基础单价规则不完善，请完善后保存')
      return msg
    }
    if (res.isPriceWrong) {
      msg.push('基础单价规则金额--请保留小数点后两位，请修改后保存')
      return msg
    }
  }
  const res = basicInsection(arr)
  if (res.isInsection) {
    msg.push('基础单价载具规则重复，请修改后保存')
  }
  if (!res.hasDefault) {
    msg.push('基础单价载具规则无兜底数据，请添加后保存')
  }
  return msg
}

export function conditionCheck(data, keys) {
  const msg = []
  const res = checkEmptyOrWrong(data, keys)
  if (res.isEmpty) {
    msg.push('通用条件未选择，请选择后保存')
  }
  // for (const key of keys) {
  //   if (!data[key]) {
  //     msg.push('通用条件未选择，请选择后保存')
  //   }
  // }
  return msg
}
