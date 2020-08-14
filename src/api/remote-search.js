import request from '@/utils/request'

export function searchUser(name) {
  return request({
    url: '/vue-element-admin/search/user',
    method: 'get',
    params: { name }
  })
}

export function transactionList(query) {
  return request({
    url: '/vue-element-admin/transaction/list',
    method: 'get',
    params: query
  })
}

// 将blob返回值转为下载文件
export function getBlobFile(query) {
  return request({
    url: '/vue-element-admin/transaction/list',
    method: 'get',
    params: {
      query,
      responseType: 'blob'
    },
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
