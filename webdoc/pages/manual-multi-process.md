## 开启多进程支持

CC支持跨进程调用组件：
- App内部
- 跨App（仅适用于开发期间使用）

默认情况下，多进程的支持为**关闭状态**

### 开启跨app组件调用支持的方法

单个组件module独立以application方式编译运行时，想要与主app之间相互调用，需要二者同时开启跨app组件调用功能。

开启方式：

```java
CC.enableRemoteCC(true); //开启跨app组件调用
```

再次强调一下：跨app组件调用支持功能仅适用于开发期间，打生产包时请关闭此功能（`CC.enableRemoteCC(false);`）。

### 开启App内部多进程支持的方法

修改`cc-settings-2.gradle`，添加：
```groovy
//开启app内部多进程组件调用
ccregister.multiProcessEnabled = true
```

开启多进程后，cc-register创建会自动为AndroidManifest.xml中声明的所有进程创建一个RemoteProvider的子类用于跨进程通信

如果确定某些进程不需要跨进程通信（例如一些第三方SDK所创建的进程），可以将添加以下配置，将其从cc-register的创建名单中移除
```groovy
//开启app内部多进程组件调用时，可以启用下方的配置排除一些进程
ccregister.excludeProcessNames = [':pushservice', ':processNameB']
```

### App内部多进程相关的注解

在组件类（`IComponent`实现类）上添加一个注解，标明其所在进程（在主进程运行组件无需添加注解）

- 无注解               ： 该组件类在主进程中运行
- @SubProcess(":web") ： 该组件类运行在packageName:web子进程，demo请戳[这里][sub_process]
- @AllProcess         ： 该组件类在App内所有进程中都存在一个对象，调用该组件时，调用的是调用方所在进程中的组件类对象
    - @AllProcess注解可用于在多进程环境下提供:在调用方所在进程中创建自定义Fragment/View等对象的服务
    - @AllProcess注解的demo请戳[这里][all_process]

示例代码如下
```java
//DemoComponent组件在主进程运行
public class DemoComponent implements IComponent{} 

//指定DemoComponentA组件所在的进程名称为 'packageName:yourProcessName'
@SubProcess(":yourProcessName") 
public class DemoComponentA implements IComponent{}

//指定DemoComponentB组件所在的进程名称为 'a.b.c'
@SubProcess("a.b.c") 
public class DemoComponentB implements IComponent{}

//指定DemoComponentC组件在主进程和所有子进程内都存在，每个进程调用进程内部的DemoComponentC组件
@AllProcess         
public class DemoComponentC implements IComponent{}
```

__注意：这样做并不会创建新的进程，而是指定此组件在哪个进程运行__

__如果没有在AndroidManifest.xml中声明对应的进程，此组件无效__


### 用法

下面以子进程WebActivity来示例：

```java
//在:web子进程运行（对应AndroidManifest.xml中的 android:process=":web" ）
@SubProcess(":web")
public class WebComponent implements IComponent {
    @Override
    public String getName() {
        return "webComponent";
    }

    @Override
    public boolean onCall(CC cc) {
        //这里只是演示一下@SubProcess注解的用法
        //如果像这样仅仅只有一个activity跳转的功能，WebComponent并不需要@SubProcess注解
        //但，如果需要在此处涉及:web子进程的内存操作，则WebComponent必须要添加@SubProcess(":web")
        String actionName = cc.getActionName();
        switch (actionName) {
            case "openUrl":
                return openUrl(cc);
            default:
                CC.sendCCResult(cc.getCallId(), CCResult.errorUnsupportedActionName());
                break;
        }

        return false;
    }

    private boolean openUrl(CC cc) {
        CCUtil.navigateTo(cc, WebActivity.class);
        CC.sendCCResult(cc.getCallId(), CCResult.success());
        return false;
    }
}
```
AndroidManifest.xml如下：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.billy.cc.demo.component.jsbridge">
    <application>
        <activity 
            android:name=".WebActivity" 
            android:process=":web" 
            />
    </application>
</manifest>
```

如果要提供一个在任意进程中创建一个自己封装过的WebView对象的服务，需要用到注解：@AllProcess

```java
@AllProcess
public class JsBridgeComponent implements IComponent {
    @Override
    public String getName() {
        return "jsBridge";
    }

    @Override
    public boolean onCall(CC cc) {
        String actionName = cc.getActionName();
        switch (actionName) {
            case "createWebView":
                //由于JsBridgeComponent添加了@AllProcess注解
                // 在任意进程可以调用此action来创建一个新的面向组件封装的WebView
                return createWebView(cc);
            default:
                CC.sendCCResult(cc.getCallId(), CCResult.errorUnsupportedActionName());
                break;
        }
        return false;
    }

    private boolean createWebView(CC cc) {
        BridgeWebView webView = BridgeWebViewHelper.createWebView(cc.getContext());
        CC.sendCCResult(cc.getCallId(), CCResult.success("webView", webView));
        return false;
    }
}
```

<font color="red">再次申明：不管组件的服务是如何实现，也不管组件在哪个进程，只要组件的[调用协议][调用协议]不变，其调用方式及代码都是一样的</font>


以上示例代码选自CC开源代码目录下的[demo_component_jsbridge][demo_component_jsbridge]，源码中演示了：
- 如何将WebActivity运行在子进程并和其它进程通过CC通信
- 如果优雅地面向组件封装jsBridge
- 如何向所有进程提供一个创建自定义WebView的服务

### 实现原理

CC的跨进程组件调用方案在2.0.0版本时进行了重构，最新的实现方案详情请查阅[CC实现原理][cc-principle]中的第二点第4节和第三点第4节

[demo_component_jsbridge]: https://github.com/luckybilly/CC/tree/master/demo_component_jsbridge/src/main/java/com/billy/cc/demo/component/jsbridge
[调用协议]: #/manual-IComponent
[cc-principle]: #/article-cc-principle
[sub_process]: https://github.com/luckybilly/CC/blob/master/demo_component_jsbridge/src/main/java/com/billy/cc/demo/component/jsbridge/WebComponent.java
[all_process]: https://github.com/luckybilly/CC/blob/master/demo_component_jsbridge/src/main/java/com/billy/cc/demo/component/jsbridge/JsBridgeComponent.java

