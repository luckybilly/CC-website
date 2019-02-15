## 集成CC step3:调用组件

调用组件分为同步调用和异步调用2种方式

- 同步调用：调用方将用同步的方式获得返回的调用结果
- 异步调用：调用方通过回调接收组件的调用结果


示例如下：
```java
//同步调用，直接返回结果
CCResult result = CC.obtainBuilder("ComponentA")
        .setActionName("showActivity")
        .build()
        .call();
//或 异步调用，不需要回调结果
String callId = CC.obtainBuilder("ComponentA")
        .setActionName("showActivity")
        .build()
        .callAsync();
//或 异步调用，在子线程执行回调
String callId = CC.obtainBuilder("ComponentA")
        .setActionName("showActivity")
        .build()
        .callAsync(new IComponentCallback() {
            @Override
            public void onResult(CC cc, CCResult result) {
                //此onResult在子线程中运行
            }
        });
//或 异步调用，在主线程执行回调
String callId = CC.obtainBuilder("ComponentA")
        .setActionName("login")
        .build()
        .callAsyncCallbackOnMainThread(new IComponentCallback() {
            @Override
            public void onResult(CC cc, CCResult result) {
                //此onResult在主线程中运行
                String toast = "login " + (result.isSuccess() ? "success" : "failed");
                Toast.makeText(MainActivity.this, toast, Toast.LENGTH_SHORT).show();
            }
        });
```

不管是同步调用还是异步调用，都可以通过CCResult获取组件执行的结果

于是，我们可以告别`onActivityResult`繁琐的写法了
- 不再依赖Activity和Fragment对象来发起页面跳转(startActivityForResult)
- 不再为Fragment（特别是嵌套使用时）的onActivityResult神坑发愁
- 回调代码不再是必须写在Activity或Fragment类中了

注：由于同步调用时会占用当前线程直至CCResult返回，所以：
- 不要<font color="red">在主线程同步调用</font>耗时操作，否则会导致卡住主线程2秒后返回超时的CCResult (code = -9)
- 不要<font color="red">在主线程同步调用</font>一个“异步实现但在主线程运行的服务”，否则结果同上，有点绕，举些例子：
    - 组件的服务需要打开登录页面，在登录操作完成(或取消)后返回登录结果
    - 组件的服务执行需要通过广播接收器接收到信息后才能返回组件调用结果
    - 组件的服务执行需要bindService，并需要在`onServiceConnected`中才能返回组件调用结果
    - 其它需要在主线程异步完成的任务

所以，<font color="red">在主线程中，建议只在确实有需要的时候才使用同步调用</font>


