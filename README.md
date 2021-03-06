

## 关于 CC

[点这里访问CC的文档](https://luckybilly.github.io/CC-website/)

[点这里访问CC的文档](https://luckybilly.github.io/CC-website/)

[点这里访问CC的文档](https://luckybilly.github.io/CC-website/)

CC是一套Android的组件化框架，由CC核心API类库和cc-register插件组成

模块|CC|cc-register
:---:|:---:|:---:
当前最新版本| [![Download](https://api.bintray.com/packages/hellobilly/android/cc/images/download.svg)](https://bintray.com/hellobilly/android/cc/_latestVersion)| [![Download](https://api.bintray.com/packages/hellobilly/android/cc-register/images/download.svg)](https://bintray.com/hellobilly/android/cc-register/_latestVersion)


<div align=center><img src="https://github.com/luckybilly/CC/raw/master/image/icon.png"/></div>

### CC的特色
- 一静一动，开发时运行2个app：
  - 静：主App (通过跨App的方式单组件App内的组件)
  - 动：单组件App (通过跨App的方式调用主App内的组件)
- 支持渐进式组件化改造
  - <font color=red>解耦只是过程，而不是前提</font>

### 一句话介绍CC：
CC是一套基于组件总线的、支持渐进式改造的、支持跨进程调用的、完整的Android组件化框架

- 基于组件总线： 
    - 不同于市面上种类繁多的路由框架，CC采用了基于组件总线的架构，不依赖于路由
- 支持渐进式改造： 
    - 接入CC后可立即用以组件的方式开发新业务，可单独运行调试开发，通过跨app的方式调用项目中原有功能
    - 不需要修改项目中现有的代码，只需要新增一个IComponent接口的实现类（组件类）即可支持新组件的调用
    - 模块解耦不再是前提，将陡峭的组件化改造实施曲线拉平
- 支持跨进程调用： 
    - 支持应用内跨进程调用组件，支持跨app调用组件
    - 调用方式与同一个进程内的调用方式完全一致
    - 无需bindService、无需自定义AIDL，无需接口下沉
- 完整：
    - CC框架下组件提供的服务可以是几乎所有功能，包括但不限于页面跳转、提供服务、获取数据、数据存储等
    - CC提供了配套插件cc-register，完成了自定义的组件类、全局拦截器类及json转换工具类的自动注册，
    - cc-register同时还提供了代码隔离、debug代码分离、组件单独调试等各种组件化开发过程中需要的功能

CC的设计灵感来源于服务端的服务化架构，将组件之间的关系拍平，不互相依赖但可以互相调用，不需要再管理复杂的依赖树。

## 调用组件API

CC 使用简明的流式语法API，因此它允许你在一行代码搞定组件调用：

"CC"也是本框架主入口API类的类名，是由ComponentCaller缩写而来，其核心职能是:**组件的调用者**。

```java
CC.obtainBuilder("ComponentA")
  .setActionName("showActivity")
  .build()
  .call();
```
也可以这样
```java
CC.obtainBuilder("ComponentA")
  .setActionName("showActivity")
  .build()
  .callAsync();
```
或者这样
```java
CC.obtainBuilder("ComponentA")
  .setActionName("showActivity")
  .build()
  .callAsyncCallbackOnMainThread(new IComponentCallback() {
        @Override
        public void onResult(CC cc, CCResult result) {
          String toast = result.isSuccess() ? "success" : "failed";
          Toast.makeText(MainActivity.this, toast, Toast.LENGTH_SHORT).show();
        }
    });
```
## 创建组件API

创建一个组件也十分简单：只要创建一个`IComponent`接口的实现类，在onCall方法中实现组件暴露的服务即可
```java
public class ComponentA implements IComponent {
  @Override
  public String getName() {
      //指定组件的名称
      return "ComponentA";
  }
  @Override
  public boolean onCall(CC cc) {
    String actionName = cc.getActionName();
    switch (actionName) {
      case "showActivity": //响应actionName为"showActivity"的组件调用
        //跳转到页面：ActivityA
        CCUtil.navigateTo(cc, ActivityA.class);
        //返回处理结果给调用方
        CC.sendCCResult(cc.getCallId(), CCResult.success());
        break;
      default:
        //其它actionName当前组件暂时不能响应，可以通过如下方式返回状态码为-12的CCResult给调用方
        CC.sendCCResult(cc.getCallId(), CCResult.errorUnsupportedActionName());
        break;
    }
    return false;
  }
}

```
