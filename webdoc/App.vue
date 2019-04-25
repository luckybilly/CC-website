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
        <div style="text-align:center;margin-bottom:10px;"> 
          <a href="https://www.hiapp.net/fromcc" target="_blank">
            <img style="width:200px;" src="http://hiapp-public.oss-cn-hangzhou.aliyuncs.com/adimg/hiapp_cc.png"/>
          </a>
        </div>
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
          <img width="20" v-if="showSideBar" src="./imgs/sidebar-hide.png"/>
          <img width="20" v-if="!showSideBar" src="./imgs/sidebar-show.png"/>
        </div>
        <div v-if="!mobileBrowser && showQrBlock" class="qr-block">
          <div style="position:absolute; top:0; right:0;" @click="toggleShowQrBlock()">x</div>
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
      mobileBrowser: false,
      showQrBlock: true
    }
  },
  methods: {
    toggleSidebar () {
      this.showSideBar = !this.showSideBar
    },
    toggleShowQrBlock () {
      this.showQrBlock = false
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
    //友盟统计
    const script = document.createElement('script');
    script.src = 'https://s65.cnzz.com/z_stat.php?id=1277362177&web_id=1277362177';
    script.language = 'JavaScript';
    document.body.appendChild(script);
  },
  watch: {
    '$route' () {
      if (window._czc) {
        let location = window.location;//路由变化
        let contentUrl = location.pathname + location.hash;//自定义当前url，可带上路由以此区分每个页面
        console.log(contentUrl);
        let refererUrl = '/';
        window._czc.push(["_setAutoPageview", false]);
        window._czc.push(["_trackPageview", contentUrl, refererUrl])
      }
    }
  }
}

</script>

<style>
@import './common/index.css';
</style>
