export default {
  list: [
    {
      name: '介绍CC',
      list: [
        {
          name: '关于CC',
          path: '/about'
        },{
          name: 'DEMO',
          path: '/cc-demo'
        },{
          name: '功能列表',
          path: '/cc-functions'
        },{
          name: '更新日志',
          path: '/changelog'
        },{
          name: 'Q & A',
          path: '/q&a',
          nick: '常见问题'
        }
      ]
    },
    {
      name: '集成CC',
      list: [
        {
          name: '0. 集成的前提',
          path: '/requirements'
        },{
          name: '1. 集成组件化开发环境',
          path: '/integration'
        },{
          name: '2. 创建组件',
          path: '/integration-create-component'
        },{
          name: '3. 调用组件',
          path: '/integration-call-component'
        },{
          name: '4. 组件独立运行调试',
          path: '/integration-component-run-alone'
        }
      ]
    },
    {
      name: '大版本升级',
      list: [
        {
          name: '2.0版升级指南',
          path: '/1.x_to_2.x',
          nick: '1.x.x -> 2.x.x'
        }
      ]
    },
    {
      name: '知识点手册',
      list: [
        {
          name: 'CC',
          path: '/manual-CC',
          nick: '组件调用入口'
        },{
          name: 'CCResult',
          path: '/manual-CCResult',
          nick: '组件调用结果'
        },{
          name: '状态码清单',
          path: '/cc-error-code-list',
          nick: 'CCResult状态码'
        },{
          name: 'IComponent',
          path: '/manual-IComponent',
          nick: '组件类'
        },{
          name: 'IDynamicComponent',
          path: '/manual-IDynamicComponent',
          nick: '动态组件类'
        },{
          name: 'IComponentCallback',
          path: '/manual-IComponentCallback',
          nick: '异步回调'
        },{
          name: 'ICCInterceptor',
          path: '/manual-ICCInterceptor',
          nick: '拦截器'
        },{
          name: 'IGlobalCCInterceptor',
          path: '/manual-IGlobalCCInterceptor',
          nick: '全局拦截器'
        },{
          name: 'IMainThread',
          path: '/manual-IMainThread',
          nick: '主线程运行'
        },{
          name: 'IParamJsonConverter',
          path: '/manual-IParamJsonConverter',
          nick: 'Json转换器'
        },{
          name: 'BaseForwardInterceptor',
          path: '/manual-BaseForwardInterceptor',
          nick: '调用转发'
        },{
          name: '开启多进程支持',
          path: '/manual-multi-process'
        },{
          name: 'IActionProcessor',
          path: '/manual-IActionProcessor'
        },{
          name: '支持热修复、插件化及aar打包',
          path: '/support-plugin-hotfix'
        }
      ]
    },
    {
      name: '实践经验',
      list: [
        {
          name: '1. 先登录再跳转到目标页面',
          path: '/practice_1'
        },{
          name: '2. Fragment和View的组件化',
          path: '/practice_2'
        },{
          name: '3. 让jsBridge更优雅',
          path: '/practice_3',
          nick: '面向组件封装'
        },{
          name: '4. 监听登录状态',
          path: '/practice_4',
          nick: '应用动态组件'
        }
      ]
    },
    {
      name: '组件化技术文章',
      list: [
        {
          name: 'CC实现原理',
          path: '/article-cc-principle'
        },{
          name: '使用CC进行渐进式组件化改造',
          path: '/article-componentize-gradually'
        },{
          name: '路由 VS 总线',
          path: '/article-router_vs_bus'
        },{
          name: '组件化开源框架对比',
          path: '/article-componentize_contrast'
        }
      ]
    }
  ]
}