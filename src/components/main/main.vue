<template>
  <Layout style="height: 100%"
          class="main">
    <Sider hide-trigger
           collapsible
           :width="220"
           :collapsed-width="50"
           v-model="collapsed"
           class="left-sider"
           :style="{overflow: 'hidden'}">
      <side-menu accordion
                 ref="sideMenu"
                 :active-name="$route.name"
                 :collapsed="collapsed"
                 @on-select="turnToPage"
                 :menu-list="menuList">
        <!-- 需要放在菜单上面的内容，如Logo，写在side-menu标签内部，如下 -->
        <!-- <div class="logo-con">
          <img v-show="!collapsed"
               :src="maxLogo"
               key="max-logo" />
          <img v-show="collapsed"
               :src="minLogo"
               key="min-logo" />
        </div> -->
      </side-menu>
    </Sider>
    <Layout>
      <Header class="header-con">
        <header-bar ref="headerBar"
                    :collapsed="collapsed"
                    :menuPage="menuPage"
                    @on-coll-change="handleCollapsedChange"
                    @menu-change="handleMenuChange">

          <!-- 用户信息 -->
          <user :message-unread-count="unreadCount"
                :user-avator="userAvator" />

          <!-- 多语言 -->
          <!-- <language v-if="$config.useI18n"
                    @on-lang-change="setLocal"
                    style="margin-right: 10px;"
                    :lang="local" /> -->

          <!-- 错误日志 -->
          <!-- <error-store v-if="$config.plugin['error-store'] && $config.plugin['error-store'].showInHeader"
                       :has-read="hasReadErrorPage"
                       :count="errorCount"></error-store> -->

          <!-- 全屏 -->
          <fullscreen v-model="isFullscreen"
                      style="margin-right: 10px;" />

          <!-- 产线号 -->
          <!-- <div class="line-num">{{lineNo}}号产线</div> -->

        </header-bar>
      </Header>
      <Content class="main-content-con">
        <Layout class="main-layout-con">
          <!-- <div class="tag-nav-wrapper">
            <tags-nav :value="$route"
                      @input="handleClick"
                      :list="tagNavList"
                      @on-close="handleCloseTag" />
          </div> -->
          <Content class="content-wrapper">
            <keep-alive :include="cacheList">
              <router-view />
            </keep-alive>
            <ABackTop :height="100"
                      :bottom="80"
                      :right="50"
                      container=".content-wrapper"></ABackTop>
          </Content>
        </Layout>
      </Content>
    </Layout>
  </Layout>
</template>
<script>
import store from "@/store";
import SideMenu from "./components/side-menu";
import HeaderBar from "./components/header-bar";
import TagsNav from "./components/tags-nav";
import User from "./components/user";
import ABackTop from "./components/a-back-top";
import Fullscreen from "./components/fullscreen";
// import Language from './components/language';
import ErrorStore from "./components/error-store";
import { mapMutations, mapActions, mapGetters } from "vuex";
import {
  // getNewTagList,
  routeEqual
} from "@/libs/util";
// import routers from "@/router/routers";
import minLogo from "@/assets/images/dooya-min.png";
import maxLogo from "@/assets/images/dooya.jpg";
// import minLogo from '@/assets/images/702-180_small.png';
// import maxLogo from '@/assets/images/702-180_big.png';
import "./main.less";
// function
import { params } from "@/libs/params";

export default {
  name: "Main",
  components: {
    SideMenu,
    HeaderBar,
    // Language,
    TagsNav,
    Fullscreen,
    ErrorStore,
    User,
    ABackTop
  },
  data() {
    return {
      collapsed: false,
      minLogo,
      maxLogo,
      isFullscreen: false,
      lineNo: "",
      menuPage: "" // 顶部菜单切换
    };
  },
  computed: {
    ...mapGetters(["errorCount"]),
    tagNavList() {
      return this.$store.state.app.tagNavList;
    },
    tagRouter() {
      return this.$store.state.app.tagRouter;
    },
    userAvator() {
      return this.$store.state.user.avatorImgPath;
    },
    /* eslint-disable */
    cacheList() {
      const list = [
        "ParentView",
        ...(this.tagNavList.length
          ? this.tagNavList
              .filter(item => !(item.meta && item.meta.notCache))
              .map(item => item.name)
          : [])
      ];
      return list;
    },
    menuList() {
      // return this.$store.getters.menuList;
      // return this.$store.state.app.menuList;
      var menuList = this.$store.state.app.menuList.filter(menu => {
        return menu.meta.parentId === this.menuPage;
      });
      return menuList; // 改造：动态生成左侧菜单
    },
    local() {
      return this.$store.state.app.local;
    },
    hasReadErrorPage() {
      return this.$store.state.app.hasReadErrorPage;
    },
    unreadCount() {
      return this.$store.state.user.unreadCount;
    }
  },
  methods: {
    ...mapMutations([
      "setBreadCrumb",
      // "setRootMenu",
      "setTagNavList",
      "addTag",
      "setLocal",
      "setHomeRoute",
      "closeTag"
    ]),
    ...mapActions([
      "handleLogin"
      // 'getUnreadMessageCount'
    ]),
    turnToPage(route) {
      let { name, params, query } = {};
      if (typeof route === "string") name = route;
      else {
        name = route.name;
        params = route.params;
        query = route.query;
      }
      if (name.indexOf("isTurnByHref_") > -1) {
        window.open(name.split("_")[1]);
        return;
      }
      this.$router.push({
        name,
        params,
        query
      });
    },
    handleCollapsedChange(state) {
      this.collapsed = state;
    },
    // 回调事件：顶部菜单切换
    handleMenuChange(value) {
      this.menuPage = value;
    },
    handleCloseTag(res, type, route) {
      if (type !== "others") {
        if (type === "all") {
          // this.turnToPage(this.$config.homeName);
          this.turnToPage(res[0].name); // 改造：关闭所有->关闭除了第一项的所有
        } else {
          if (routeEqual(this.$route, route)) {
            this.closeTag(route);
          }
        }
      }
      this.setTagNavList(res);
    },
    handleClick(item) {
      this.turnToPage(item);
    }
  },
  watch: {
    $route(newRoute) {
      const { name, query, params, meta } = newRoute;
      this.addTag({
        route: { name, query, params, meta },
        type: "push"
      });
      this.setBreadCrumb(newRoute);
      // this.setTagNavList(getNewTagList(this.tagNavList, newRoute)); // 改造：动态添加tag标签
      this.$refs.sideMenu.updateOpenName(newRoute.name);
    },
    menuList: {
      handler(newVal, oldVal) {
        // 切换顶部菜单 && 已登录状态非新打开网页
        if (newVal.length > 0 && oldVal.length !== 0) {
          // 调用 side-menu 子组件的 handleSelect 事件
          this.$refs.sideMenu.handleSelect(newVal[0].children[0].name, true);
        }
      },
      deep: true
    }
  },
  created() {
    // 产线号
    this.lineNo = params(this, "loginLineNo") || "22";
    // 当前选中的顶部菜单
    this.menuPage =
      params(this, "currentMenuPage") ||
      this.menuList.filter(menu => {
        return menu.meta.parentId === "rootMenu";
      })[0].meta.id;
  },
  mounted() {
    /**
     * 解决 css 引入图片在 github pages 无法获取的问题
     */
    const { NODE_ENV } = process.env;
    document.documentElement.className = NODE_ENV;
    /**
     * @description 初始化设置面包屑导航和标签导航
     */
    this.setTagNavList();
    // this.setHomeRoute(routers);
    this.setHomeRoute(store.state.app.menuList); // 改造：根据动态菜单生成面包屑
    const { name, params, query, meta } = this.$route;
    this.addTag({
      route: { name, params, query, meta }
    });
    this.setBreadCrumb(this.$route);
    // 设置初始语言
    this.setLocal(this.$i18n.locale);
    // 如果当前打开页面不在标签栏中，跳到homeName页
    if (!this.tagNavList.find(item => item.name === this.$route.name)) {
      this.$router.push({
        name: this.$config.homeName
      });
    }
    // 获取未读消息条数
    // this.getUnreadMessageCount();
  }
};
</script>
