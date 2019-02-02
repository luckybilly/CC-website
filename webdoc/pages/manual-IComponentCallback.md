## 类介绍: IComponentCallback.java

异步调用组件时设置的回调对象

```java
public interface IComponentCallback {
	/**
	 * 组件调用结束后会调用此方法
	 * 将本次组件调用时的CC对象和调用结果的CCResult对象作为参数传入
	 * @param cc 本次组件调用的CC对象
	 * @param result 本次组件调用的结果：CCResult
	 */
	void onResult(CC cc, CCResult result);
}
```

其中cc对象和result对象均不会为null，省去了判空操作
~~~
如果组件类或者拦截器中返回的CCResult为null
	框架会自动将其封装为CCResult.defaultNullResult();
	其状态码(code=-3)
如果在CC调用执行过程中出现了未捕获的Exception
	框架会自动将其封装为CCResult.defaultExceptionResult()
	其状态码(code=-4)
~~~

组件调用时的方式决定了onResult方法在哪个线程运行：
```java
//或 异步调用，不需要回调结果
CC.obtainBuilder("ComponentA")
    .setActionName("showActivity")
    .build()
    .callAsync();
//异步调用，在子线程执行回调
CC.obtainBuilder("ComponentA")
    .setActionName("showActivity")
    .build()
    .callAsync(new IComponentCallback() {
        @Override
        public void onResult(CC cc, CCResult result) {
            //此onResult在子线程中运行
        }
    });
//异步调用，在主线程执行回调
CC.obtainBuilder("ComponentA")
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
