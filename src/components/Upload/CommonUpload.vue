<!--
  组件说明：
  1. 允许同时选择多个文件。
  2. 文件大小，格式，数量校验
  3. 有一般云服务或者cdn对接的api
  4. todo 一般的方式对接云服务，node 文件上传脚本
-->
<template>
  <div
    :class="
      config.__uploadFileListType === 'text'
        ? 'common-upload-component'
        : 'common-upload-component2'
    "
  >
    <el-upload
      :action="config.__uploadFileApi"
      :on-success="uploadNewFileSuccess"
      :on-remove="handleNewFileRemove"
      :before-upload="uploadFileBefore"
      :on-exceed="handleExceed"
      :on-error="uploadFileError"
      :on-preview="handlePreview"
      multiple
      :limit="config.__uploadFileLengthMax"
      :file-list="uploadFileList"
      :on-change="handleChange"
      :accept="config.__uploadFileAcceptType"
      :list-type="config.__uploadFileListType"
      :disabled="disabled"
    >
      <el-button
        v-if="config.__uploadFileListType === 'text'"
        size="small"
        type="primary"
        :loading="isUploading"
        :disabled="disabled"
      >
        上传附件
      </el-button>
      <i
        v-else
        class="el-icon-plus"
      />
      <div
        slot="tip"
        class="el-upload__tip"
      >
        <div v-if="showDefaultTip">
          备注：1.只能上传Excel、Word、PDF、图片、视频、压缩包，其他格式不能上传；2.附件数量小于等于{{
            config.__uploadFileLengthMax
          }}；3.每个文件小于{{ config.__uploadFileSizeMax[0] }}。
        </div>
        <slot name="extraTip" />
      </div>
    </el-upload>
  </div>
</template>

<script>
import { api } from '../../constant.js'
import { isImage, downloadImg, downloadFile } from 'utils/utils'
export default {

  props: {
    config: {
      type: Object,
      default: function() {
        return {
          __uploadFileApi: api.fileUpload,
          __uploadFileLengthMax: 100,
          __uploadFileNameLengthMax: 30,
          __uploadFileSizeMax: ['40M', 40 * 1024000],
          __uploadFileAcceptType:
            '.doc, .docx, .xls, .xlsx, .ppt, .xlsx, .pdf, .jpg, .jpeg, .png, .bmp, .tiff, .gif, .svg, .avi, .mov, .rmvb, .rm, .flv, .mp4, .3gp, .zip, .rar, .7z',
          __uploadFileListType: 'text'
        }
      }
    },
    uploadFileList: Array,
    showDefaultTip: { type: Boolean, default: true },
    isPreview: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      choseFileslength: 0,
      successFileLength: 0,
      errorFileLength: 0,
      errorNameList: [],
      isUploading: false,
      illegalCharList: ['%', '*', '?', '\\', ';', '`', '"', '^', '|']
    }
  },

  methods: {
    /* 修改是否正在上传的状态，并传到父级 */
    setUploadStatus(status) {
      this.isUploading = status
      this.$emit('updateIsUploading', status)
    },

    /* 修改已上传列表，并传到父级 */
    setUploadFileList(arr) {
      this.uploadFileList = arr
      this.$emit('getUploadFile', arr)
    },

    uploadNewFileSuccess(response, file, fileList) {
      // 此处有特殊性，文件只要上传就会 200, 需要在每个文件的状态为 success 时，再为 this.uploadFileList 赋值
      if (fileList.every(current => current.status === 'success')) {
        const finalList = fileList.filter(
          current => (current.response && +current.response.status === 1) || !current.response
        )

        this.setUploadFileList(finalList)
        this.setUploadStatus(false)
      }

      if (response) {
        if (!(+response.status === 1)) {
          this.$message.error(response.message)
        }
      } else {
        this.$message.error('上传失败')
      }
    },

    /* 移除文件时调用 */
    handleNewFileRemove(file, fileList) {
      this.setUploadFileList(fileList)
    },

    /* 获取选择文件的长度 */
    handleChange() {
      const choseFileslength = document.querySelector('input[type=file]').files.length
      if (choseFileslength > 0) {
        this.choseFileslength = choseFileslength
        this.successFileLength = 0
        this.errorFileLength = 0
      }
    },

    /* 文件上传之前 */
    uploadFileBefore(file) {
      const fileName = file.name.slice(0, file.name.lastIndexOf('.'))
      const isLimitLength30 = fileName.length <= this.config.__uploadFileNameLengthMax
      const isLimit40M = file.size <= this.config.__uploadFileSizeMax[1]

      for (let i = 0, len = this.illegalCharList.length; i < len; i++) {
        const item = this.illegalCharList[i]
        if (name.indexOf(item) > -1) {
          this.$message.error(`文件名不能含有${item}特殊字符`)
          return false
        }
      }

      if (!isLimit40M) {
        this.errorNameList.push(file.name)
        this.errorFileLength++
      } else {
        this.successFileLength++
      }

      this.setUploadStatus(true)

      if (this.errorFileLength > 0) {
        // 用于保证所选的文件均已经遍历过一次
        if (this.errorFileLength + this.successFileLength === this.choseFileslength) {
          const nameString = this.errorNameList.join(', ')
          // 重置状态
          this.errorNameList = []
          this.choseFileslength = 0
          this.setUploadStatus(false)
          this.$message.error(`${nameString}超过${this.config.__uploadFileSizeMax[0]}，不能上传`)
        }
      }

      if (!isLimitLength30) {
        this.$message.error(`文件名最多${this.config.__uploadFileNameLengthMax}位，请修改后上传`)
        this.setUploadStatus(false)
      }

      return isLimit40M && isLimitLength30
    },

    /* 超过设置的文件总数 */
    handleExceed(files, fileList) {
      console.log('files:', files)
      console.log('fileList:', fileList)
      this.$message.error(`文件最多选择${this.config.__uploadFileLengthMax}个，请重选`)
    },

    /* 上传报错 */
    uploadFileError() {
      this.setUploadStatus(false)
    },

    /* 图片预览 */
    handlePreview(file) {
      if (this.isPreview) {
        const response = file.response || {}
        const data = response.data || {}
        // if (data.url) window.open(data.url)
        const url = data.url
        const name = file.name
        if (isImage(url)) {
          downloadImg(url, name)
        } else {
          downloadFile(url, name)
        }
      }
    }
  }
}
</script>

<style lang="less">
.common-upload-component {
  .el-upload-list {
    li {
      width: 20%;
      display: inline-block;
    }
  }
}
.common-upload-component2 {
  .el-upload-list {
    li {
      width: 80px;
      height: 80px;
    }
  }
  .el-upload--picture-card {
    width: 80px;
    height: 80px;
    line-height: 80px;
  }
  .el-upload--picture-card i {
    font-size: 20px;
  }
}
</style>
