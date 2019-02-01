webpackJsonp([1],{"5LCA":function(t,s,e){t.exports=e("nUvY")},nUvY:function(t,s,e){"use strict";Object.defineProperty(s,"__esModule",{value:!0});var a={render:function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("section",[e("h2",[t._v("关于 CC")]),t._v(" "),e("p",[t._v("CC是一套Android的组件化框架，由CC核心API类库和cc-register插件组成")]),t._v(" "),t._m(0),t._v(" "),t._m(1),t._v(" "),e("h3",[t._v("CC的特色")]),t._v(" "),e("ul",[t._m(2),t._v(" "),e("li",[t._v("支持"),e("a",{attrs:{href:"#/componentize-gradually"}},[t._v("渐进式组件化改造")]),t._v(" "),e("ul",[e("li",[e("font",{attrs:{color:"red"}},[t._v("解耦只是过程，而不是前提")])],1)])])]),t._v(" "),e("h3",[t._v("一句话介绍CC：")]),t._v(" "),e("p",[t._v("CC是一套基于组件总线的、支持渐进式改造的、支持跨进程调用的、完整的Android组件化框架")]),t._v(" "),t._m(3),t._v(" "),e("p",[t._v("CC的设计灵感来源于服务端的服务化架构，将组件之间的关系拍平，不互相依赖但可以互相调用，不需要再管理复杂的依赖树。")]),t._v(" "),e("h2",[t._v("调用组件API")]),t._v(" "),e("p",[t._v("CC 使用简明的流式语法API，因此它允许你在一行代码搞定组件调用：")]),t._v(" "),t._m(4),t._v(" "),t._m(5),t._v(" "),e("p",[t._v("也可以这样")]),t._v(" "),t._m(6),t._v(" "),e("p",[t._v("或者这样")]),t._v(" "),t._m(7),t._v(" "),e("h2",[t._v("创建组件API")]),t._v(" "),t._m(8),t._v(" "),t._m(9),t._v(" "),e("h3",[t._v("开始使用")]),t._v(" "),e("p",[t._v("CC于2018年9月16日升级到2.0.0版，重构了跨进程通信机制和自动注册插件，并且集成方式有了比较大的变化，此文档仅针对2.x.x版本。")]),t._v(" "),t._m(10),t._v(" "),t._m(11),t._v(" "),t._m(12)])},staticRenderFns:[function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("table",[e("thead",[e("tr",[e("th",{staticStyle:{"text-align":"center"}},[t._v("模块")]),t._v(" "),e("th",{staticStyle:{"text-align":"center"}},[t._v("CC")]),t._v(" "),e("th",{staticStyle:{"text-align":"center"}},[t._v("cc-register")])])]),t._v(" "),e("tbody",[e("tr",[e("td",{staticStyle:{"text-align":"center"}},[t._v("当前最新版本")]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[e("a",{attrs:{href:"https://bintray.com/hellobilly/android/cc/_latestVersion"}},[e("img",{attrs:{src:"https://api.bintray.com/packages/hellobilly/android/cc/images/download.svg",alt:"Download"}})])]),t._v(" "),e("td",{staticStyle:{"text-align":"center"}},[e("a",{attrs:{href:"https://bintray.com/hellobilly/android/cc-register/_latestVersion"}},[e("img",{attrs:{src:"https://api.bintray.com/packages/hellobilly/android/cc-register/images/download.svg",alt:"Download"}})])])])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{attrs:{align:"center"}},[s("img",{attrs:{src:"https://github.com/luckybilly/CC/raw/master/image/icon.png"}})])},function(){var t=this.$createElement,s=this._self._c||t;return s("li",[this._v("一静一动，开发时运行2个app：\n"),s("ul",[s("li",[this._v("静：主App (通过跨App的方式单组件App内的组件)")]),this._v(" "),s("li",[this._v("动：单组件App (通过跨App的方式调用主App内的组件)")])])])},function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("ul",[e("li",[t._v("基于组件总线：\n"),e("ul",[e("li",[t._v("不同于市面上种类繁多的路由框架，CC采用了基于组件总线的架构，不依赖于路由("),e("a",{attrs:{href:"#/router_vs_bus"}},[t._v("路由 VS 总线")])])])]),t._v(" "),e("li",[t._v("支持渐进式改造：\n"),e("ul",[e("li",[t._v("接入CC后可立即用以组件的方式开发新业务，可单独运行调试开发，通过跨app的方式调用项目中原有功能")]),t._v(" "),e("li",[t._v("不需要修改项目中现有的代码，只需要新增一个IComponent接口的实现类（组件类）即可支持新组件的调用")]),t._v(" "),e("li",[t._v("模块解耦不再是前提，将陡峭的组件化改造实施曲线拉平")])])]),t._v(" "),e("li",[t._v("支持跨进程调用：\n"),e("ul",[e("li",[t._v("支持应用内跨进程调用组件，支持跨app调用组件")]),t._v(" "),e("li",[t._v("调用方式与同一个进程内的调用方式完全一致")]),t._v(" "),e("li",[t._v("无需bindService、无需自定义AIDL，无需接口下沉")])])]),t._v(" "),e("li",[t._v("完整：\n"),e("ul",[e("li",[t._v("CC框架下组件提供的服务可以是几乎所有功能，包括但不限于页面跳转、提供服务、获取数据、数据存储等")]),t._v(" "),e("li",[t._v("CC提供了配套插件cc-register，完成了自定义的组件类、全局拦截器类及json转换工具类的自动注册，")]),t._v(" "),e("li",[t._v("cc-register同时还提供了代码隔离、debug代码分离、组件单独调试等各种组件化开发过程中需要的功能")])])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v('"CC"也是本框架主入口API类的类名，是由ComponentCaller缩写而来，其核心职能是:'),s("strong",[this._v("组件的调用者")]),this._v("。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("pre",{pre:!0},[s("code",{pre:!0,attrs:{"v-pre":"",class:"language-java"}},[this._v("CC.obtainBuilder("),s("span",{pre:!0,attrs:{class:"hljs-string"}},[this._v('"ComponentA"')]),this._v(")\n  .setActionName("),s("span",{pre:!0,attrs:{class:"hljs-string"}},[this._v('"showActivity"')]),this._v(")\n  .build()\n  .call();\n")])])},function(){var t=this.$createElement,s=this._self._c||t;return s("pre",{pre:!0},[s("code",{pre:!0,attrs:{"v-pre":"",class:"language-java"}},[this._v("CC.obtainBuilder("),s("span",{pre:!0,attrs:{class:"hljs-string"}},[this._v('"ComponentA"')]),this._v(")\n  .setActionName("),s("span",{pre:!0,attrs:{class:"hljs-string"}},[this._v('"showActivity"')]),this._v(")\n  .build()\n  .callAsync();\n")])])},function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("pre",{pre:!0},[e("code",{pre:!0,attrs:{"v-pre":"",class:"language-java"}},[t._v("CC.obtainBuilder("),e("span",{pre:!0,attrs:{class:"hljs-string"}},[t._v('"ComponentA"')]),t._v(")\n  .setActionName("),e("span",{pre:!0,attrs:{class:"hljs-string"}},[t._v('"showActivity"')]),t._v(")\n  .build()\n  .callAsyncCallbackOnMainThread("),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("new")]),t._v(" IComponentCallback() {\n        "),e("span",{pre:!0,attrs:{class:"hljs-function"}},[t._v("@Override\n        "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("public")]),t._v(" "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("void")]),t._v(" "),e("span",{pre:!0,attrs:{class:"hljs-title"}},[t._v("onResult")]),e("span",{pre:!0,attrs:{class:"hljs-params"}},[t._v("(CC cc, CCResult result)")]),t._v(" ")]),t._v("{\n          String toast = result.isSuccess() ? "),e("span",{pre:!0,attrs:{class:"hljs-string"}},[t._v('"success"')]),t._v(" : "),e("span",{pre:!0,attrs:{class:"hljs-string"}},[t._v('"failed"')]),t._v(";\n          Toast.makeText(MainActivity."),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("this")]),t._v(", toast, Toast.LENGTH_SHORT).show();\n        }\n    });\n")])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("创建一个组件也十分简单：只要创建一个"),s("code",{pre:!0},[this._v("IComponent")]),this._v("接口的实现类，在onCall方法中实现组件暴露的服务即可")])},function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("pre",{pre:!0},[e("code",{pre:!0,attrs:{"v-pre":"",class:"language-java"}},[e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("public")]),t._v(" "),e("span",{pre:!0,attrs:{class:"hljs-class"}},[e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("class")]),t._v(" "),e("span",{pre:!0,attrs:{class:"hljs-title"}},[t._v("ComponentA")]),t._v(" "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("implements")]),t._v(" "),e("span",{pre:!0,attrs:{class:"hljs-title"}},[t._v("IComponent")]),t._v(" ")]),t._v("{\n  "),e("span",{pre:!0,attrs:{class:"hljs-function"}},[t._v("@Override\n  "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("public")]),t._v(" String "),e("span",{pre:!0,attrs:{class:"hljs-title"}},[t._v("getName")]),e("span",{pre:!0,attrs:{class:"hljs-params"}},[t._v("()")]),t._v(" ")]),t._v("{\n      "),e("span",{pre:!0,attrs:{class:"hljs-comment"}},[t._v("//指定组件的名称")]),t._v("\n      "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("return")]),t._v(" "),e("span",{pre:!0,attrs:{class:"hljs-string"}},[t._v('"ComponentA"')]),t._v(";\n  }\n  "),e("span",{pre:!0,attrs:{class:"hljs-function"}},[t._v("@Override\n  "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("public")]),t._v(" "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("boolean")]),t._v(" "),e("span",{pre:!0,attrs:{class:"hljs-title"}},[t._v("onCall")]),e("span",{pre:!0,attrs:{class:"hljs-params"}},[t._v("(CC cc)")]),t._v(" ")]),t._v("{\n    String actionName = cc.getActionName();\n    "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("switch")]),t._v(" (actionName) {\n      "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("case")]),t._v(" "),e("span",{pre:!0,attrs:{class:"hljs-string"}},[t._v('"showActivity"')]),t._v(": "),e("span",{pre:!0,attrs:{class:"hljs-comment"}},[t._v('//响应actionName为"showActivity"的组件调用')]),t._v("\n        "),e("span",{pre:!0,attrs:{class:"hljs-comment"}},[t._v("//跳转到页面：ActivityA")]),t._v("\n        CCUtil.navigateTo(cc, ActivityA.class);\n        "),e("span",{pre:!0,attrs:{class:"hljs-comment"}},[t._v("//返回处理结果给调用方")]),t._v("\n        CC.sendCCResult(cc.getCallId(), CCResult.success());\n        "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("break")]),t._v(";\n      "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("default")]),t._v(":\n        "),e("span",{pre:!0,attrs:{class:"hljs-comment"}},[t._v("//其它actionName当前组件暂时不能响应，可以通过如下方式返回状态码为-12的CCResult给调用方")]),t._v("\n        CC.sendCCResult(cc.getCallId(), CCResult.errorUnsupportedActionName());\n        "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("break")]),t._v(";\n    }\n    "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("return")]),t._v(" "),e("span",{pre:!0,attrs:{class:"hljs-keyword"}},[t._v("false")]),t._v(";\n  }\n}\n\n")])])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("如果您使用的是1.x.x版CC，可以参照"),s("a",{attrs:{href:"#/1.x_to_2.x"}},[this._v("2.0版升级指南")]),this._v("中的说明来升级到2.x.x版本")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("请访问"),s("a",{attrs:{href:"#/requirements"}},[this._v("集成要求")]),this._v("页面，查看集成所需要的前提条件。")])},function(){var t=this.$createElement,s=this._self._c||t;return s("p",[this._v("然后可以从"),s("a",{attrs:{href:"#/integration"}},[this._v("集成组件化开发环境")]),this._v("页面学习如何集成组件化开发环境，然后再学习如何"),s("a",{attrs:{href:"#/integration-create-component"}},[this._v("创建组件")]),this._v("和"),s("a",{attrs:{href:"#/integration-call-component"}},[this._v("调用组件")]),this._v("。")])}]},r=e("VU/8")(null,a,!1,null,null,null);s.default=r.exports}});
//# sourceMappingURL=1.e9b5a683f639438f4eb7.js.map