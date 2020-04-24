<template>
  <div class="header-bar">
    <sider-trigger :collapsed="collapsed"
                   icon="md-menu"
                   @on-change="handleCollpasedChange"></sider-trigger>
    <Menu v-if="rootMenuList.length>0"
          style="display:inline-block"
          mode="horizontal"
          :active-name="menuPage"
          @on-select="menuOnselect">
      <MenuItem v-for="menu in rootMenuList"
                :key="menu.meta.id"
                :name="menu.meta.id">
      <Icon :type="menu.icon" />
      {{menu.meta.title}}
      </MenuItem>
    </Menu>
    <!-- <custom-bread-crumb show-icon
                        style="margin-left: 30px;"
                        :list="breadCrumbList"></custom-bread-crumb> -->
    <div class="custom-content-con">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import siderTrigger from "./sider-trigger";
import customBreadCrumb from "./custom-bread-crumb";
import "./header-bar.less";
export default {
  name: "HeaderBar",
  components: {
    siderTrigger,
    customBreadCrumb
  },
  props: {
    collapsed: Boolean,
    menuPage: String // 记录顶部选择的菜单
  },
  computed: {
    breadCrumbList() {
      return this.$store.state.app.breadCrumbList;
    },
    // 顶部菜单
    rootMenuList() {
      var rootMenuList = this.$store.state.app.menuList.filter(menu => {
        return menu.meta.parentId === "rootMenu";
      });
      return rootMenuList;
    }
  },
  created() {
    // 如果是移动端小屏，则初始化时收起菜单
    if (document.body.clientWidth <= 900) {
      this.handleCollpasedChange(true);
    }
  },
  methods: {
    handleCollpasedChange(state) {
      this.$emit("on-coll-change", state);
    },
    // 切换顶部菜单
    menuOnselect(value) {
      localStorage.setItem("currentMenuPage", value); // 存储到localStorage
      this.$emit("menu-change", value); // 传给父组件
    }
  }
};
</script>
