## 集成CC step1:建构组件化开发的环境

下面介绍的是在Android Studio中进行集成的方式

#### 1. 在工程根目录的build.gradle中添加cc-register插件的classpath。
最新版本号：<img class="auto-width" src="https://api.bintray.com/packages/hellobilly/android/cc-register/images/download.svg">

```groovy
buildscript {
    dependencies {
        classpath 'com.billy.android:cc-register:x.x.x' //使用最新版
    }
}
```

#### 2. 在工程根目录创建一个名为"cc-settings-2.gradle"的文件，并将以下代码复制到该文件中（也可直接下载github中的[cc-settings-2.gradle][5]文件到工程根目录）
CC最新版：<img class="auto-width" src="https://api.bintray.com/packages/hellobilly/android/cc/images/download.svg"/>
```groovy
project.apply plugin: 'cc-register'
project.dependencies.add('api', "com.billy.android:cc:2.1.2") //用最新版

//此文件是作为组件化配置的公共gradle脚本文件，在每个组件中都apply此文件，下载到工程根目录后，可以在下方添加一些自己工程中通用的配置

// 可参考cc-settings-demo.gradle
// 例如：
//      1. 添加全局拦截器、下沉的公共类库等一些公共基础库的依赖；
//      2. 添加自定义的通过cc-register实现的自动注册配置
//      3. 开启app内部多进程支持
//      4. 其它公共配置信息


//开启app内部多进程组件调用时启用下面这行代码
//ccregister.multiProcessEnabled = true

//开启app内部多进程组件调用时，可以启用下方的配置排除一些进程
//ccregister.excludeProcessNames = [':pushservice', ':processNameB']

//按照如下格式添加自定义注册项，可添加多个（也可每次add一个，add多次）
//ccregister.registerInfo.add([
//        //在自动注册组件的基础上增加：自动注册组件B的processor
//        'scanInterface'             : 'com.billy.cc.demo.component.b.processor.IActionProcessor'
//        , 'codeInsertToClassName'   : 'com.billy.cc.demo.component.b.ComponentB'
//        , 'codeInsertToMethodName'  : 'initProcessors'
//        , 'registerMethodName'      : 'add'
//])
```

### 3. 开启debug模式
debug模式下，会在Logcat中输出一些CC框架内部的执行日志，开启方式为：
```java
CC.enableDebug(true); // 默认是false: 关闭状态
```

### 4. 开启CC调用日志跟踪
开启日志跟踪后，会在Logcat中输出CC调用的详细流程，将打印出每一个执行时的CC对象或CCResult对象的详细信息，开启方式为：
```java
CC.enableVerboseLog(true);	// 默认是false: 关闭状态
```

注意：
~~~
开启CC调用日志跟踪(CC.enableVerboseLog(true);)后，由于会频繁调用以下对象的toString方法：
	CC、CCResult、RemoteCC、RemoteCCResult
这会带来一定的性能损耗
故在打正式上线包时，一定要将其关闭CC.enableVerboseLog(false);
~~~

### 5. 开启跨app组件调用
CC支持跨app调用组件，开启方式为：
```java
CC.enableRemoteCC(true); // 默认是false: 关闭状态
```
注意：
~~~
由于部分机型（如小米、VIVO等）在系统上做了后台启动的权限限制
所以跨app调用组件启动activity之前，需要手动进入系统权限设置页面，为主app及所有单独运行调试的app赋予"自启动"、"后台弹出界面"等权限
也因为这个原因，CC的跨app组件调用只适用于开发阶段，请勿用于产品逻辑。
同时，为了您的应用安全，请确保在打正式包时关闭跨app组件调用CC.enableRemoteCC(false);
~~~
---
至此，您已经完成了CC集成的初步工作：建构组件化开发的环境，在此基础上，您可以：
- 开发新业务：直接以组件的方式开发
- 解耦老业务：在业务空闲时间一步步解耦

接下来请通过[创建组件][6]来了解如何在您的项目中用组件的方式来开发新业务吧！



[1]: https://api.bintray.com/packages/hellobilly/android/cc-register/images/download.svg
[2]: https://bintray.com/hellobilly/android/cc-register/_latestVersion
[3]: https://api.bintray.com/packages/hellobilly/android/cc/images/download.svg
[4]: https://bintray.com/hellobilly/android/cc/_latestVersion
[5]: https://github.com/luckybilly/CC/blob/master/cc-settings-2.gradle
[6]: #/integration-create-component




