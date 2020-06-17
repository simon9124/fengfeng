import Vue from "vue";
import Router from "vue-router";
import { routes, constantRouter, mainRouter } from "./routers";
import store from "@/store";
import iView from "iview";
import { setToken, getToken, canTurnTo, setTitle } from "@/libs/util";
import config from "@/config";

const { homeName } = config;

Vue.use(Router);

const router = new Router({
  routes
  // 部署到github gh-pages -> 取消history
  // mode: 'history'
});

const LOGIN_PAGE_NAME = "login"; // 登录页
const whiteList = []; // 白名单

const turnTo = (to, access, next) => {
  if (to.path === "/") {
    // 已经登录的用户新打开 "/"" -> 跳回该用户登录后的首页
    if (JSON.stringify(access).indexOf("visitor") > -1) {
      // 车间主管 -> 直接进入驾驶舱-车间
      next({
        name: "geology"
      });
    } else {
      next({
        name: homeName
      });
    }
  } else {
    if (canTurnTo(to.name, access, routes)) {
      // 有权限，可访问
      next();
    } else {
      // 无权限，重定向到401页面
      next({
        replace: true,
        name: "error_401"
      });
    }
  }
};

// 方法：初始化路由表刷新
export const refreshRoute = () => {
  const routes = [...constantRouter, ...mainRouter];
  router.matcher = new Router({ routes }).matcher;
};

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start();
  const token = getToken();
  if (whiteList.indexOf(to.name) !== -1) {
    // 在免登录白名单
    next(); // 直接进入
  } else if (!token && to.name !== LOGIN_PAGE_NAME) {
    // 未登录且要跳转的页面不是登录页
    next({
      name: LOGIN_PAGE_NAME // 跳转到登录页
    });
  } else if (!token && to.name === LOGIN_PAGE_NAME) {
    // 未登陆且要跳转的页面是登录页（或退出登录） -> 重新加载不含动态数据的原始路由
    refreshRoute();
    next(); // 跳转
  } else if (token && to.name === LOGIN_PAGE_NAME) {
    // 已登录且要跳转的页面是登录页
    next({
      name: homeName // 跳转到homeName页
    });
  } else {
    // 已登录且要跳转的页面不是登录页
    if (store.state.user.hasGetInfo) {
      // 首次登录
      turnTo(to, store.state.user.access, next);
    } else {
      // 刷新页面 -> 重新获取用户信息 & 重新添加动态路由
      store
        .dispatch("getUserInfo")
        .then(user => {
          store.dispatch("getRouters").then(res => {
            // 拉取用户信息，通过用户权限和跳转的页面的name来判断是否有权限访问;access必须是一个数组，如：['super_admin'] ['super_admin', 'admin']
            turnTo(to, user.data.roles, next);
          });
        })
        .catch(() => {
          setToken("");
          next({
            name: "login"
          });
        });
    }
  }
});

router.afterEach(to => {
  setTitle(to, router.app);
  iView.LoadingBar.finish();
  window.scrollTo(0, 0);
});

const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

export default router;
