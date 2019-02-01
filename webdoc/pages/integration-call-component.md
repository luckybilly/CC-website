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
        .setActionName("showActivity")
        .build()
        .callAsyncCallbackOnMainThread(new IComponentCallback() {
            @Override
            public void onResult(CC cc, CCResult result) {
                //此onResult在主线程中运行
                String toast = result.isSuccess() ? "success" : "failed";
                Toast.makeText(MainActivity.this, toast, Toast.LENGTH_SHORT).show();
            }
        });
```





