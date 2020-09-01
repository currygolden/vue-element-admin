<template>
  <div
    ref="list"
    class="infinite-list-container"
    :style="{'max-height': maxHeight + 'px'}"
    @scroll="handleListScroll"
  >
    <div class="infinite-list-outter" :style="{'height': totalHeight + 'px'}">
      <div class="infinite-list" :style="{transform: getTransform}">
        <div
          v-for="(item,index) in visibleData"
          :key="index"
          class="infinite-item"
          :style="{'height': singleHeight + 'px'}"
        >
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VirtualList',
  props: {
    // 大量的列表数据
    listData: {
      type: Array,
      default: () => []
    },
    // 每一行的高度
    singleHeight: {
      type: Number,
      default: 25
    },
    // 容器的高度
    maxHeight: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      // 可视区域高度
      start: 0,
      end: null,
      scrollDistance: 0
    }
  },
  computed: {
    // 列表总高度
    totalHeight() {
      return this.singleHeight * this.listData.length
      // return this.singleHeight * this.listData.length
    },
    // 可视区域的数目
    visibleCount() {
      return Math.floor(this.maxHeight / this.singleHeight)
    },
    // 实际展示的列表数据
    visibleData() {
      return this.listData.slice(this.start, Math.min(this.end, this.listData.length))
    },
    getTransform() {
      return `translate3d(0,${this.scrollDistance}px,0)`
    }
  },
  mounted() {
    // 获取高度
    this.start = 0
    this.end = this.start + this.visibleCount
  },
  methods: {
    // 监听滚动处理数组的起点，终点
    handleListScroll() {
      const scrollTop = this.$refs.list.scrollTop
      this.start = Math.floor(scrollTop / this.singleHeight)
      this.end = this.start + this.visibleCount
      this.scrollDistance = scrollTop
    }
  }
}
</script>

<style lang="scss">
  .infinite-list-container {
    overflow: scroll;
    .infinite-item {
      text-align: center;
    }
  }
</style>
