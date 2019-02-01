<template>
  <div id="app">
    <div class="main-header">
      <div v-if="!mobileBrowser" class="main-header-title">CC<span class="main-header-desc">业界首个支持渐进式组件化改造的Android组件化框架，支持跨进程调用</span></div>
      <ul class="main-header-nav">
        <li class="github">
          如果您认可CC，请点击<a href="https://github.com/luckybilly/CC"><img style="vertical-align:middle;" src="https://img.shields.io/github/stars/luckybilly/CC.svg?style=social&label=Stars"/></a>支持一下！
        </li>
      </ul>
    </div>

    <div class="main-">
      <div class="main--left" :class="!showSideBar ? 'sidebar-hidden' : '' ">
        <ul v-for="(item, index) in itemList">
          <li v-if="item.name" class="group-title">{{ item.name }}</li>
          <li v-for="(it, i) in item.list" @click="onSidebarClick">
            <router-link :to="it.path">
              {{ it.name }}
              <span v-if="it.nick" class="nick">{{ it.nick }}</span>
            </router-link>
          </li>
        </ul>
      </div>
      <div class="main--right" >
        <router-view class="markdown" :style="{'display': (mobileBrowser & showSideBar) ? 'none' : ''}"></router-view>
        <div class="sidebar-toggel" @click="toggleSidebar()">
          <img width="20" v-if="showSideBar" src="./sidebar-hide.png"/>
          <img width="20" v-if="!showSideBar" src="./sidebar-show.png"/>
        </div>
        <div v-if="!mobileBrowser" class="qr-block">
          <img width="100" src="https://github.com/luckybilly/CC/raw/master/image/CC_QQ.png"/>
          <p style="color:blue;">扫码加QQ群交流</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import componentList from './componentList.js'
export default {
  name: 'App',
  data () {
    return {
      itemList: componentList.list,
      showSideBar: true,
      mobileBrowser: false
    }
  },
  methods: {
    toggleSidebar () {
      this.showSideBar = !this.showSideBar
    },
    onSidebarClick () {
      if (this.mobileBrowser) {
        this.showSideBar = false
      }
    }
  },
  mounted () {
    this.$router.onReady(() => {
      //PC和手机上分别展示
      var sUserAgent=navigator.userAgent;
      var mobileAgents=['Android','iPhone','Symbian','WindowsPhone','iPod','BlackBerry','Windows CE'];
      var mobile = false;
      for( var i = 0; i < mobileAgents.length; i++){
        if(sUserAgent.indexOf(mobileAgents[i]) > -1){
          mobile = true;
          break;
        }
      }
      this.mobileBrowser = mobile
      if (mobile) {
        this.showSideBar = false
      };
    })
  }
}
</script>

<style>
@import './common/index.css';
</style>
