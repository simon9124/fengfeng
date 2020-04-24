<template>
  <div class="dooya-container">
    <Card>
      <div class="title">
        {{title}}
      </div>
    </Card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: ""
    };
  },
  created() {
    this.title = this.$route.meta.title;
  },
  methods: {},
  watch: {
    $route(to, from) {
      this.title = to.meta.title;
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dooya-container /deep/ {
  .title {
    font-size: 28px;
    font-weight: bold;
  }
  .ivu-card-body {
    height: calc(100vh - 120px);
    overflow-x: auto;
    overflow-y: auto;
    overflow: overlay;
  }
}
</style>
