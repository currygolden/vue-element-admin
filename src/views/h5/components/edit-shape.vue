<template>
  <!-- 每个组件都有的包裹层可以来操作属性,提供8个操作点, 包裹区+内部实际组件 -->
  <div
    class="component-edit-wrapper"
    :class="{active: active}"
    @click="handleTopWrapperClick()"
    @mousedown="handleMouseDownElement(item)"
  >
    <div
      v-for="(item, index) in (active ? pointList : [])"
      :key="index"
      class="edit-shape-point"
      :style="getPointStyle(item)"
      @mousedown="handleMouseDownPoint(item)"
    />
    <slot />
  </div>
</template>

<script>
export default {
  name: 'EditShape',
  props: {
    active: {
      type: Boolean,
      default: false
    },
    defaultStyle: {
      type: Object,
      require: false
    },
    uuid: {
      type: String,
      required: false
    }
  },
  data() {
    return {
      pointList: ['lt', 'rt', 'lb', 'rb', 'l', 'r', 't', 'b'],
      // 用来生产鼠标指向
      directionKey: {
        t: 'n',
        b: 's',
        l: 'w',
        r: 'e'
      }
    }
  },
  methods: {
    // 根据元素宽高 确定每一个点的定位属性
    getPointStyle(point) {
      const pos = this.defaultStyle
      const height = pos.height
      const width = pos.width

      // 确定点的位置
      const hasT = /t/.test(point)
      const hasB = /b/.test(point)
      const hasL = /l/.test(point)
      const hasR = /r/.test(point)

      let newLeft = 0
      let newTop = 0
      // 区分顶点和中心点
      if (point.length === 2) {
        newLeft = hasL ? 0 : width
        newTop = hasT ? 0 : height
      } else {
        if (hasT || hasB) {
          newLeft = hasL ? 0 : width
          newTop = height / 2
        }

        if (hasT || hasB) {
          newLeft = width / 2
          newTop = hasT ? 0 : height
        }
      }

      // 鼠标经过会有方向的指向
      const style = {
        marginLeft: (hasL || hasR) ? '-5px' : 0,
        marginTop: (hasT || hasB) ? '-5px' : 0,
        left: `${newLeft}px`,
        top: `${newTop}px`,
        cursor: point.split('').reverse().map(m => this.directionKey[m]).join('') + '-resize'
      }
      return style
    },
    handleTopWrapperClick(e) {
      // 控制点的外层，阻止事件行为
      e.stopPropagation()
      e.preventDefault()
    }
  }
}
</script>

<style lang="scss">
  .component-edit-wrapper {
    cursor: move;
    &.active {
      outline: 1px dashed #25A589;
    }
    &:hover {
      outline: 1px dashed #25A589;
    }
  }

  .edit-shape-point {
    width: 10px;
    height: 10px;
    background-color: #fff;
    border: 1px solid #59c7f9;
    border-radius: 10px;
    position: absolute;
    z-index: 1001;
  }
</style>
