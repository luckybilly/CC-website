## CC实现原理

## 前言

首先说明一下，本文将讲述的组件化与业内的插件化（如：Atlas, RePlugin等）不是同一个概念

![组件化 vs 插件化](https://user-gold-cdn.xitu.io/2017/12/9/1603a35e8992e0dd?w=640&h=335&f=jpeg&s=11279)

【图片来源于网络】

组件化开发：就是将一个app分成多个Module，每个Module都是一个组件(也可以是一个基础库供组件依赖)，开发的过程中我们可以单独调试部分组件，组件间不需要互相依赖，但可以相互调用，最终发布的时候所有组件以lib的形式被主app工程依赖并打包成1个apk。

插件化开发：和组件化开发略有不用，插件化开发时将整个app拆分成很多模块，这些模块包括一个宿主和多个插件，每个模块都是一个apk（组件化的每个模块是个lib），最终打包的时候将宿主apk和插件apk(或其他格式)分开或者联合打包。

**本文将主要就以下几个方面进行介绍：**

一、为什么需要组件化？

二、CC技术要点

三、CC执行流程详细解析

## 一、为什么需要组件化？

关于使用组件化的理由，上网能搜到很多，如业务隔离、单独以app运行能提高开发及调试效率等等这里就不多重复了，我补充一条：组件化之后，我们能很容易地实现一些组件层面的AOP，例如：

- 轻易实现页面数据(网络请求、I/O、数据库查询等)预加载的功能
- 组件被调用时，进行页面跳转的同时异步执行这些耗时逻辑
- 页面跳转并初始化完成后，再将这些提前加载好的数据展示出来
- 在组件功能调用时进行登录状态校验
- 借助拦截器机制，可以动态给组件功能调用添加不同的中间处理逻辑


## 二、 CC技术要点
实现CC组件化开发框架主要需要解决的问题有以下几个方面：

- 组件如何自动注册？
- 如何兼容同步/异步方式调用组件？
- 如何兼容同步/异步方式实现组件？
- 如何跨app调用组件？
- 组件如何更方便地在application和library之间切换？
- 如何实现startActivityForResult？
- 如何与Activity、Fragment的生命周期关联起来

### 1 组件如何自动注册？
为了减少后期维护成本，想要实现的效果是：当需要添加某个组件到app时，只需要在gradle中添加一下对这个module的依赖即可（通常都是maven依赖，也可以是project依赖）

最初想要使用的是annotationProcessor通过编译时注解动态生成组件映射表代码的方式来实现。但尝试过后发现行不通，因为编译时注解的特性只在源码编译时生效，无法扫描到aar包里的注解（project依赖、maven依赖均无效），也就是说必须每个module编译时生成自己的代码，然后要想办法将这些分散在各aar种的类找出来进行集中注册。

ARouter的解决方案是：

- 每个module都生成自己的java类，这些类的包名都是'com.alibaba.android.arouter.routes'
- 然后在运行时通过读取每个dex文件中的这个包下的所有类通过反射来完成映射表的注册，详见[ClassUtils.java源码](https://github.com/alibaba/ARouter/blob/master/arouter-api/src/main/java/com/alibaba/android/arouter/utils/ClassUtils.java)

    
 运行时通过读取所有dex文件遍历每个entry查找指定包内的所有类名，然后反射获取类对象。这种效率看起来并不高。

ActivityRouter的解决方案是(demo中有2个组件名为'app'和'sdk')：

- 在主app module中有一个`@Modules({"app", "sdk"})`注解用来标记当前app内有多少组件，根据这个注解生成一个RouterInit类
- 在RouterInit类的init方法中生成调用同一个包内的RouterMapping_app.map
- 每个module生成的类(RouterMapping_app.java 和 RouterMapping_sdk.java)都放在com.github.mzule.activityrouter.router包内（在不同的aar中，但包名相同）
- 在RouterMapping_sdk类的map()方法中根据扫描到的当前module内所有路由注解，生成了调用Routers.map(...)方法来注册路由的代码
- 在Routers的所有api接口中最终都会触发RouterInit.init()方法，从而实现所有路由的映射表注册

  这种方式用一个RouterInit类组合了所有module中的路由映射表类，运行时效率比扫描所有dex文件的方式要高，但需要额外在主工程代码中维护一个组件名称列表注解: @Modules({"app", "sdk"})
    
还有没有更好的办法呢？

Transform API: 可以在编译时(dex/proguard之前)扫描当前要打包到apk中的**所有类**，包括: 当前module中java文件编译后的class、aidl文件编译后的class、jar包中的class、aar包中的class、project依赖中的class、maven依赖中的class。

ASM: 可以读取分析字节码、可以修改字节码

二者结合，可以做一个gradle插件，在编译时自动扫描所有组件类(IComponent接口实现类)，然后修改字节码，生成代码调用扫描到的所有组件类的构造方法将其注册到一个组件管理类([ComponentManager](https://github.com/luckybilly/CC/blob/master/cc/src/main/java/com/billy/cc/core/component/ComponentManager.java))中，生成组件名称与组件对象的映射表。   

此gradle插件被命名为：[AutoRegister](https://github.com/luckybilly/AutoRegister)，现已开源，并将功能升级为编译时自动扫描任意指定的接口实现类(或类的子类)并自动注册到指定类的指定方法中。只需要在app/build.gradle中配置一下扫描的参数，没有任何代码侵入，原理详细介绍[传送门](http://blog.csdn.net/cdecde111/article/details/78074692)

【2018-10-07补充】开源了一年多的时间，AutoRegister已基本成熟稳定，但为了在插件中实现一些CC框架需要的功能（如：自动生成跨进程通信的RemoteProvider子类并注册到AndroidManifest.xml中），从AutoRegister fork出一份cc-register，从CC2.0.0开始，将使用cc-register插件

### 2 如何兼容同步/异步方式调用组件？
通过实现`java.util.concurrent.Callable`接口同步返回结果来兼容同步/异步调用：

- 同步调用时，直接调用`CCResult result = Callable.call()`来获取返回结果
- 异步调用时，将其放入线程池中运行，执行完成后调用回调对象返回结果: [IComponentCallback.onResult(cc, result)](https://github.com/luckybilly/CC/blob/master/cc/src/main/java/com/billy/cc/core/component/IComponentCallback.java)
  
```java
ExecutorService.submit(callable)
```

### 3 如何兼容同步/异步方式实现组件？
调用组件的onCall方法时，可能需要异步实现，并不能同步返回结果，但同步调用时又需要返回结果，这是一对矛盾。

此处用到了Object的wait-notify机制，当组件需要异步返回结果时，在CC框架内部进行阻塞，等到结果返回时，通过notify中止阻塞，返回结果给调用方

*注意，这里要求在实现一个组件时，必须确保组件一定会回调结果，即：需要确保每一种导致调用流程结束的逻辑分支上(包括if-else/try-catch/Activity.finish()-back键-返回按钮等等)都会回调结果，否则会导致调用方一直阻塞等待结果，直至超时。类似于向服务器发送一个网络请求后服务器必须返回请求结果一样，否则会导致请求超时。*

### 4 如何跨app调用组件？
**为什么需要跨app进行组件调用呢？**

1. 对现有项目进行组件化改造的过程，肯定不是一蹴而就，而是一个个组件逐步从主工程中抽离，这就涉及到主工程与组件间的通信。如果不能跨app进行组件调用，开发时就需要跟主工程一起打包，失去了组件化开发的一个非常大的优势：组件单独编译运行提高开发&测试效率。
2. 当独立运行的组件需要调用到其他组件的功能时，不需要将其他组件编译进来一起打包，可以调用主app中的组件，可以始终保持单module编译运行的状态进行开发。
3. 参考阅读：[使用CC进行渐进式组件化改造](https://github.com/luckybilly/CC/wiki/%E4%BD%BF%E7%94%A8CC%E8%BF%9B%E8%A1%8C%E6%B8%90%E8%BF%9B%E5%BC%8F%E7%BB%84%E4%BB%B6%E5%8C%96%E6%94%B9%E9%80%A0)

**目前，常见的组件化框架采用的跨app通信解决方案有：**

 - URLScheme(如：[ActivityRouter](https://github.com/mzule/ActivityRouter)、[阿里ARouter](https://github.com/alibaba/ARouter)等)
   - 优点：
     - 基因中自带支持从webview中调用
     - 不用互相注册（不用知道需要调用的app的进程名称等信息）
   - 缺点:
     - 只能单向地给组件发送信息，适用于启动Activity和发送指令，不适用于获取数据(例如：获取用户组件的当前用户登录信息)
     - 需要有个额外的中转Activity来统一处理URLScheme，然后进行转发
     - 如果设备上安装了多个使用相同URLScheme的app，会弹出选择框（多个组件作为app同时安装到设备上时会出现这个问题）
     - 无法进行权限设置，无法进行开关设置，任意app都可调用，存在安全性风险
 - AIDL (如：[ModularizationArchitecture](https://github.com/SpinyTech/ModularizationArchitecture))
   - 优点：
     - 可以传递Parcelable类型的对象
     - 效率高
     - 可以设置跨app调用的开关
   - 缺点：
     - 调用组件之前需要提前知道该组件在那个进程，否则无法建立ServiceConnection
     - 组件在作为独立app和作为lib打包到主app时，进程名称不同，维护成本高
     
设计此功能时，我的出发点是：作为组件化开发框架基础库，想尽量让跨进程调用与在进程内部调用的功能一致，对使用此框架的开发者在切换app模式和lib模式时尽量简单，另外需要尽量不影响产品安全性。因此，跨组件间通信实现的同时，应该满足以下条件：

- 每个app都能给其它app调用
- app可以设置是否对外提供跨进程组件调用的支持
- 组件调用的请求发出去之后，能自动探测当前设备上是否有支持此次调用的app
- 支持超时、取消


【2018-10-07修改】
CC 2.0.0版开始对跨进程通信进行了重构，新版本中使用如下方式进行跨进程通信：

- 将`IBinder`封装到一个`Parcelable`中
- 将`Parcelable`放入`Bundle`中
- 将`Bundle`作为`RemoteCursor`的`Extras`
- 通过`ContentProvider`传递`RemoteCursor`，从而实现IBinder的跨进程传递
- 通过调用`IRemoteCCService.Stub.asInterface(binder)`得到`IRemoteCCService`实例:一个`RemoteCCService`对象
- 通过调用`IRemoteCCService.call(remoteCC, callback)`实现跨进程组件调用
- 在`IRemoteCCService.call(remoteCC, callback)`方法中根据`remoteCC`对象构造一个本地CC请求，并将返回的`CCResult`转换成`RemoteCCResult`对象，通过`callback(remoteCCResult)`将结果回传给调用方进程
- 调用方进程中将`remoteCCResult`转换成本地的`CCResult`对象再经过所有拦截器原路返回给组件调用发起方

如下图所示：

![获取远程IRemoteCCService实例](https://github.com/luckybilly/CC/raw/dev_multiprocess/image/sst/sst_get_remote_service.png)

![跨进程调用组件](https://github.com/luckybilly/CC/raw/dev_multiprocess/image/sst/sst_call_remote_component.png)

### 5 组件如何更方便地在application和library之间切换？
关于切换方式在网络上有很多文章介绍，基本上都是一个思路：在module的build.gradle中设置一个变量来控制切换`apply plugin: 'com.android.application'`或`apply plugin: 'com.android.library'`以及sourceSets的切换。

为了避免在每个module的build.gradle中配置太多重复代码，我将其封装到了cc-register插件中，每个组件都可以直接在android studio中点击绿色的Run按钮直接以application方式单独编译运行。

注意：单独运行的组件app如果要与主app进行相互调用，需要同时在调试设备上安装主app，并且需要确保主app在编译打包时将该组件排除，实现方式为：

- 确保主app/build.gradle中是使用addComponent来添加对组件module的依赖
- 在local.properties中增加一行配置`module_name=true`
- 重新编译打包主app

### 6 如何实现startActivityForResult？
android的startActivityForResult的设计也是为了页面传值，在CC组件化框架中，页面传值根本不需要用到startActivityForResult，直接作为异步实现的组件来处理(在原来setResult的地方调用`CC.sendCCResult(callId, ccResult)`，*另外需要注意：按back键及返回按钮的情况也要回调结果*)即可。

如果是原来项目中存在大量的startActivityForResult代码，改造成本较大，可以用下面这种方式来保留原来的onActivityResult(...)及activity中setResult相关的代码：

- 在原来调用startActivityForResult的地方，改用CC方式调用，将当前context传给组件

  ```java
  CC.obtainBuilder("demo.ComponentA")
    .setContext(context)
    .addParams("requestCode", requestCode)
    .build()
    .callAsync();
  ```
- 在组件的onCall(cc)方法中用startActivityForResult的方式打开Activity

  ```java
     @Override
     public boolean onCall(CC cc) {
         Context context = cc.getContext();
         Object code = cc.getParams().get("requestCode");
         Intent intent = new Intent(context, ActivityA.class);
         if (!(context instanceof Activity)) {
             //调用方没有设置context或app间组件跳转，context为application
             intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
         }
         if (context instanceof Activity && code != null && code instanceof Integer) {
             ((Activity)context).startActivityForResult(intent, (Integer)code);
         } else {
             context.startActivity(intent);
         }
         CC.sendCCResult(cc.getCallId(), CCResult.success());
         return false;
     }
  ```

### 7  如何与Activity、Fragment的生命周期关联起来

背景：在使用异步调用时，由于callback对象一般是使用匿名内部类，会持有外部类对象的引用，容易引起内存泄露，这种内存泄露的情况在各种异步回调中比较常见，如Handler.post(runnable)、Retrofit的Call.enqueue(callback)等。

为了避免内存泄露及页面退出后取消执行不必要的任务，CC添加了生命周期关联的功能，在onDestroy方法被调用时自动cancel页面内所有未完成的组件调用

- Activity生命周期关联

  在api level 14 (android 4.0)以上可以通过注册全局activity生命周期回调监听，在`onActivityDestroyed`方法中找出所有此activity关联且未完成的cc对象，并自动调用取消功能：
  
  ```java
  application.registerActivityLifecycleCallbacks(lifecycleCallback);
  ```
- android.support.v4.app.Fragment生命周期关联

  support库从 [25.1.0][support25] 开始支持给fragment设置生命周期监听：
  ```java
  FragmentManager.registerFragmentLifecycleCallbacks(callback)
  ```
  可在其`onFragmentDestroyed`方法中取消未完成的cc调用

- andorid.app.Fragment生命周期关联（暂不支持）

## 三、 CC执行流程详细解析

组件间通信采用了组件总线的方式，在基础库的组件管理类(ComponentMananger)中注册了所有组件对象，ComponentMananger通过查找映射表找到组件对象并调用。

当ComponentMananger接收到组件的调用请求时，查找当前app内组件清单中是否含有当前需要调用的组件

- 有： 执行App内部CC调用的流程：

![App内部组件调用总线](https://user-gold-cdn.xitu.io/2017/12/9/1603a35e86b8de45?w=686&h=452&f=png&s=36075)

- 没有：执行App之间CC调用的流程

  ![App之间组件调用总线](https://user-gold-cdn.xitu.io/2017/12/9/1603a35e9b27c92e?w=1684&h=642&f=png&s=182899)
  
### 1  组件的同步/异步实现和组件的同步/异步调用原理
- 组件实现时，当组件调用的相关功能结束后，通过CC.sendCCResult(callId, ccResult)将调用结果发送给框架
- IComponent实现类(组件入口类)onCall(cc)方法的返回值代表是否异步回调结果：
  - true:   将异步调用CC.sendCCResult(callId, ccResult)
  - false: 将同步调用CC.sendCCResult(callId, ccResult)。意味着在onCall方法执行完之前会调用此方法将结果发给框架
- 当IComponent.onCall(cc)返回false时，直接获取CCResult并返回给调用方
- 当IComponent.onCall(cc)返回true时，将进入wait()阻塞，知道获得CCResult后通过notify()中止阻塞，继续运行，将CCResult返回给调用方
- 通过ComponentManager调用组件时，创建一个实现了`java.util.concurrent.Callable`接口`ChainProcessor`类来负责具体组件的调用
  - 同步调用时，直接执行`ChainProcessor.call()`来调用组件，并将CCResult直接返回给调用方
  - 异步调用时，将`ChainProcessor`放入线程池中执行，通过`IComponentCallback.onResult(cc, ccResult)`将CCResult回调给调用方

执行过程如下图所示：

![CC兼容同步/异步调用和实现原理图](https://user-gold-cdn.xitu.io/2017/12/9/1603a35e88bf52bc?w=1058&h=1159&f=png&s=112868)
### 2 自定义拦截器(`ICCInterceptor`)实现原理
- 所有拦截器按顺序存放在调用链(Chain)中
- 先按照优先级执行所有用户自定义全局拦截器(`ICCGlobalInterceptor`接口实现类)
- 再按照发起CC调用时添加的顺序执行用户自定义拦截器(`ICCInterceptor`接口实现类)
- 然后执行CC框架自身的拦截器`ValidateInterceptor`
- `ValidateInterceptor`将在app内部查找目标组件，根据查找结果添加具体执行调用的拦截器`LocalCCInterceptor`（或`SubProcessCCInterceptor`、`RemoteCCInterceptor`)和`Wait4ResultInterceptor` 
- Chain类负责依次执行所有拦截器`interceptor.intercept(chain)`
- 拦截器`intercept(chain)`方法通过调用`Chain.proceed()`方法获取CCResult
  
![拦截器调用流程](https://github.com/luckybilly/CC/raw/dev_multiprocess/image/sst/sst_cc_interceptors.png)
  
### 3 App内部CC调用流程
当要调用的组件在当前app内部时，执行此流程，完整流程图如下：

![App内部CC调用流程图](https://github.com/luckybilly/CC/raw/dev_multiprocess/image/lct/lct_in_app.png)

CC的主体功能由一个个拦截器(`ICCInterceptor`)来完成，拦截器形成一个调用链(`Chain`)，调用链由ChainProcessor启动执行，ChainProcessor对象在ComponentManager中被创建。
因此，可以将ChainProcessor看做一个整体，由ComponentManager创建后，调用组件的onCall方法，并将组件执行后的结果返回给调用方。
ChainProcessor内部的`Wait4ResultInterceptor`
ChainProcessor的执行过程可以被timeout和cancel两种事件中止。

### 4 App之间CC调用流程
当要调用的组件在当前app内找不到时，执行此流程，完整流程图如下：

![App之间CC调用流程图](https://github.com/luckybilly/CC/raw/dev_multiprocess/image/lct/lct_cross_app.png)



## 结语

本文比较详细地介绍了android组件化开发框架《CC》的主要功能、技术方案及执行流程，并给出了使用方式的简单示例。
大家如果感兴趣的话可以[从GitHub上clone源码](https://github.com/luckybilly/CC)来进行具体的分析，如果有更好的思路和方案也欢迎贡献代码进一步完善CC。

## 致谢

[Andromeda](https://github.com/iqiyi/Andromeda)

[ActivityRouter](https://github.com/mzule/ActivityRouter)

[ARouter](https://github.com/alibaba/ARouter)

[ModularizationArchitecture](https://github.com/SpinyTech/ModularizationArchitecture)

[Android架构思考(模块化、多进程)](http://blog.spinytech.com/2016/12/28/android_modularization/)

[开源最佳实践：Android平台页面路由框架ARouter](https://yq.aliyun.com/articles/71687)

[DDComponentForAndroid](https://github.com/luojilab/DDComponentForAndroid)

[Router](https://github.com/JumeiRdGroup/Router)


[support25]: https://developer.android.com/reference/android/support/v4/app/FragmentManager.html#registerfragmentlifecyclecallbacks