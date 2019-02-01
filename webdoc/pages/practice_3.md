# CC框架实践(3): 让jsBridge更优雅

## 前言

jsBridge是作为js和java之间通信的桥梁，本身它的职责只是完成通信。

本文不是介绍js与java通信过程的实现，你可以使用第三方库（[如：JsBridge](https://github.com/lzyzsd/JsBridge)），也可以自己来实现，或者用addJavascriptInterface，都可以。本文的侧重点是如何让我们的jsBridge不那么臃肿，实现得更优雅，更利于维护。

但在实际封装过程中，会发现需要我们需要解决很多耦合的问题：

- js调用的功能在其他module中，如何调用到这些功能，如何向jsbridge注册这些功能？
- jsbridge依赖了太多module，怎么解耦？
- 当js调用的功能是打开其它页面获取该页面处理后的结果并回调给js，怎么破？ onResume? startActivityForResult? 一个常见的场景是：打开登录界面，登录成功后将用户信息回调给js。你是不是想过这样做？
    - jsBridge中封装一个Activity/Fragment
    - 用startActivityForResult的方式来打开登录页面
    - 在onActivityResult方法中从登录界面设置的result中获取用户登录的信息（或者onResume或EventBus方式来获取返回值）
    - 然后将用户信息回调给js
    
*将具体的业务逻辑写在jsBridge模块中，本身就是一个灾难，而且随着业务类型的增加，最后这个Activity/Fragment会变得非常臃肿，而且难以复用*
    
## CC框架下如何让jsBridge更优雅？

CC框架为所有组件提供了统一的调用入口和回调结果格式。

所以，在CC框架下，js调用native变得很简单：
- jsBridge仅暴露一个接口给js，那就是组件调用接口
- js调用jsBridge的接口，将组件调用所需的参数传给jsBridge
- jsBridge将参数透传去调用功能组件（所有功能实现均在各个组件内部完成）
- jsBridge中接收到调用结果后，将结果转换成json回调给js

流程图：

![jsBridge调用流程](https://user-gold-cdn.xitu.io/2017/12/25/1608ca156a8b8517?w=559&h=446&f=png&s=16869)

JsBridge的核心代码如下：
```java
public class JsBridge {

    private WeakReference<WebView> webViewWeakReference;

    public JsBridge(WebView webView) {
        this.webViewWeakReference = new WeakReference<WebView>(webView);
    }

    @JavascriptInterface
    public void callNativeCC(String componentName, String actionName, String dataJson, final String callbackId) {
        final WebView webView = webViewWeakReference.get();
        if (webView == null) {
            return;
        }
        Map<String, Object> params = null;
        if (!TextUtils.isEmpty(dataJson)) {
            try {
                JSONObject json = new JSONObject(dataJson);
                params = JsonUtil.toMap(json); //参数列表
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
        //统一使用这种方式进行CC调用，不用关心具体组件是如何实现的
        CC cc = CC.obtainBuilder(componentName)
            .steActionName(actionName)
            .setContext(webView.getContext()) //可用于startActivity等需要Context的功能
            .setParams(params)
            .build();
        if (TextUtils.isEmpty(jsCallbackId)) {
            cc.callAsync(); //无需回调结果给js
        } else {
            cc.callAsyncCallbackOnMainThread(new IComponentCallback() {
                @Override
                public void onResult(CC cc, CCResult result) {
              //将结果回调给js
                    webView.loadUrl("javascript: callback(" + callbackId + "," + result + ")"); 
                }
            });
        }
    }
}

```

是不是超级简单？

这样做的好处有：
1. jsbridge回归初心：只是作为一个桥梁。
2. jsBridge支持的功能更全面，app内部几乎所有组件的功能都可以给js调用，而无需添加额外的代码
3. 业务完全在组件内部实现，jsbridge跟组件之间无耦合
4. 无论功能是同步实现的还是异步回调实现的，中间需要经历什么样的流程，对于js和jsBridge来说调用方式完全一样。
5. 支持组件的按需依赖：jsBridge不再是全家桶，给多个app使用时，各app可以按需选择需要支持js调用的组件，添加gradle依赖到主module的依赖列表中即可。
6. 同一个组件在不同的app内可以有不同的实现，但需要保持接口协议一致，例如：不同app可以有自己特定的登录组件
7. 后续添加新功能给js调用时，只要功能提供方实现一下，js中去调用即可，jsbridge组件无需修改

## Tips


#### 1. 有些功能必须要在onActivityResult中接收结果，如何在组件内部实现而不影响jsBridge？
确实有些功能必须要在onActivityResult中接收结果，例如：调用系统的选择联系人、从系统相册选择图片等。

其实，不止是onActivityResult，还有获取权限的回调onRequestPermissionsResult

这些功能在组件内部实现时，可以在组件中通过创建一个透明的Activity或Fragment来实现结果的接收，然后将结果发送给调用方: `CC.sendCCResult(callId, result);`

<font color=blue>推荐使用Fragment方式实现</font>

具体实现方式可参考如下开源库：

- 透明Activity方式实现的权限申请库:[AndPermission](https://github.com/yanzhenjie/AndPermission), 参考类：[PermissionActivity.java](https://github.com/yanzhenjie/AndPermission/blob/master/permission/src/main/java/com/yanzhenjie/permission/PermissionActivity.java)

- Fragment方式实现的权限申请库: [RxPermissions](https://github.com/tbruyelle/RxPermissions),参考类：[RxPermissions.java](https://github.com/tbruyelle/RxPermissions/blob/master/lib/src/main/java/com/tbruyelle/rxpermissions/RxPermissions.java)  

#### 2. js调用的有些功能需要用户登录后才能用，如何加入登录条件判断？

按照组件化开发的思想，是否需要登录才能用应由各组件自行判断。

需要在组件内部完成登录状态校验、打开登录界面、登录完成后再执行组件实际功能。

具体实现可参考另一篇文章： [CC框架实践(1)：实现登录成功再进入目标界面功能](https://www.imooc.com/article/23155)

#### 3. 没有使用CC框架的情况下，如何让jsBridge实现类似效果？
在没有使用CC框架的情况下，也可以实现类似效果的。思路如下：

1. 在工程的Common基础库中定义一套接口，例如： IJsCall/IJsCallback
```java
public interface IJsCall {
    String name(); //功能的名称，供js调用
    void handleJsCall(JSONObject params, IJsCallback callback);
}
public interface IJsCallback {
    void callback(String result);
}
```
2. 在所有需要注册给js调用的组件中实现IJsCall接口，实现具体的业务逻辑
3. 在jsBridge中创建一个IJsCall的管理类JsCallMananger，示例代码：

```java
public class JsCallManager {
    private final Map<String, IJsCall> map = new HashMap<>();
    
    public static final String DEFAULT_RESULT = "{\"success\":false}";
    
    void init() {
        //用于IJsCall自动注册到list
        //使用AutoRegister插件将生成如下代码：
        // registerJsCall(new JsCallA());
        // registerJsCall(new JsCallB());
    }
    
    void registerJsCall(IJsCall call) {
        if (call != null) {
            map.put(call.name(), call);
        }
    }
    
    public void onJsCall(String name, JSONObject json, IJsCallback callback) {
        IJsCall jsCall = map.get(name);
        if (jsCall != null) {
            jsCall.handleJsCall(json, callback);
        } else {
            callback.callback(DEFAULT_RESULT);
        }
    }
}
```
4. 使用AutoRegister来完成IJsCall接口的自动注册, [Github源码](https://github.com/luckybilly/AutoRegister)
5. 在jsBridge中只暴露一个接口给js调用
6. 在jsBridge中调用JsCallManager.onJsCall方法来实现统一的功能调用


## 总结


本文介绍了在CC框架下用组件调用的方式让jsBridge实现跟具体业务完全解耦。并给出了非CC框架环境下实现类似效果的思路。
