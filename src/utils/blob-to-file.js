/**
 * 保存接口返回的 blob 数据为指定文件类型
 * response 接口返回 blob 数据
 * - response.data 为 blob
 * - response.headers
 * options 文件相关配置
 * - options.type 指定 Blob 数据类型，默认为 .csv
 * - options.fileName 文件名称
 * - options.ext 文件扩展名，默认为 .csv
 */
export default function blobToFile(response, options = {}) {
  if (!response || !response.data) return
  try {
    const blob = new Blob([response.data], {
      // 指定 Blob 数据类型，默认为 .csv
      type: options.type || 'application/vnd.openxmlformats;charset=UTF-8'
    })
    let fileName = ''
    if (options.fileName) {
      fileName = `${options.fileName}.${options.ext || '.csv'}`
    } else {
      const contentDisposition = response.headers['content-disposition'].split('filename=')
      fileName = contentDisposition[1]
        ? decodeURIComponent(contentDisposition[1])
        : 'downloadDataList.csv'
    }
    const downloadElement = document.createElement('a')
    const href = window.URL.createObjectURL(blob)
    downloadElement.href = href
    downloadElement.download = fileName
    document.body.appendChild(downloadElement)
    downloadElement.click()
    document.body.removeChild(downloadElement)
    window.URL.revokeObjectURL(href)
  } catch (e) {
    // return false
  }
}
