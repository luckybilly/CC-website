## 集成CC step1:建构组件化开发的环境

下面介绍的是在Android Studio中进行集成的方式

#### 1. 在工程根目录的build.gradle中添加cc-register插件的classpath。
最新版本号：[![Download][1]][2]

```groovy
buildscript {
    dependencies {
        classpath 'com.billy.android:cc-register:x.x.x' //使用最新版
    }
}
```

#### 2. 在工程根目录创建一个名为"cc-settings-2.gradle"的文件，并将以下代码复制到该文件中（也可直接下载github中的[cc-settings-2.gradle][5]文件到工程根目录）
CC最新版：[![Download][3]][4]
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




