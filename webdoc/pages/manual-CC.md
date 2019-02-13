## 类介绍：CC.java

CC.java是本框架的主入口API，是由ComponentCaller缩写而来，其核心职能是:**组件的调用者**。

这个类主要提供以下几种功能：
- 初始化框架
- 通过CC.Builder构建一个用于调用组件的CC对象
- 发起组件调用
- 根据callId将组件调用结果发送给调用方
- 根据callId取消某个组件调用
- 获取组件调用所携带的参数
- 注册/注销动态组件
- 注册/注销全局拦截器

### 框架初始化

```java
/**
 * CC的初始化方法
 * 同时初始化组件和全局拦截器
 * @param app Application
 * @param initComponents 如果设置为true则同时初始化组件
 * @param initGlobalInterceptors 如果设置为true则同时初始化全局拦截器
 */
CC.init(Application app, boolean initComponents, boolean initGlobalInterceptors)
```
```java
/**
 * CC的初始化方法，仅初始化CC框架本身，不初始化组件类及全局拦截器
 * 组件类及全局拦截器将在第一次执行组件调用时才被初始化
 * @param app Application
 */
CC.init(Application app)
```
开发调试时可以开启以下设置：
```java
//注：请确保正式发布时以下设置均被设置为false（未设置时，其默认值均为false）
CC.enableDebug(trueOrFalse); //开启/关闭 debug日志输出
CC.enableVerboseLog(trueOrFalse); //开启/关闭CC调用的详细跟踪日志输出
CC.enableRemoteCC(trueOrFalse); //开启/关闭跨app组件调用
```


### 使用CC.Builder通过链式编程的方式创建一个组件调用请求的CC对象

一次请求对应一个CC对象，CC对象不重复利用
~~~
这里求一个PR：在框架层面复用CC对象，避免多次创建/销毁带来的损耗
需要能避免
~~~

获取一个CC.Builder对象

每次发起组件调用都是从这个方法开始，通过此方法返回的builder对象构建具体的组件调用请求

```java
/**
 * 创建CC对象的Builder<br>
 * <b>此对象会被CC框架复用，请勿在程序中保存</b>
 * @param componentName 要调用的组件名称
 * @return 创建CC对象的Builder
 */
CC.obtainBuilder("componentName")
```
CC.Builder构建CC对象设置属性的方法有：
```java
//当前组件调用的服务名称(推荐必填)
CC.Builder setActionName(String actionName)	
//通过cc.getContext()能获取此值，若未设置，则返回application对象
CC.Builder setContext(Context context)	
//设置超时时间，单位为毫秒(timeout >= 0)
CC.Builder setTimeout(long timeout) 
//设置超时时间为无限制（在主线程同步调用时无效）
CC.Builder setNoTimeout()	

//用key-value的方式添加一个参数，通过cc.getParamItem(key)可以获取该参数
CC.Builder addParam(String key, Object value) 
//添加一个参数，但不设置key，通过cc.getParamItemWithNoKey()可以获取该参数。最多只能设置一个
CC.Builder setParamWithNoKey(Object param) 
//添加多个参数
CC.Builder addParams(Map<String, Object> params)
//设置本次组件调用的参数列表（之前添加的数据将会被清空）
CC.Builder setParams(Map<String, Object> params) 

//设置本次组件调用时禁用所有的全局拦截器(IGlobalCCInterceptor)
CC.Builder withoutGlobalInterceptor() 

//为本次组件调用添加拦截器（若有多个，可多次添加，按添加的顺序执行）
CC.Builder addInterceptor(ICCInterceptor interceptor) 

//将本次组件调用与指定activity的生命周期关联起来，在activity.onDestroy()时会自动调用cc.cancel()
CC.Builder cancelOnDestroyWith(Activity activity) 
//将本次组件调用与指定fragment的生命周期关联起来，在fragment.onDestroy()时会自动调用cc.cancel()
CC.Builder cancelOnDestroyWith(Fragment fragment) 
//CC对象构建完毕，返回CC对象
CC build() 
```

### 启动CC组件调用（一个CC对象只能调用下列方法之一，且只能调用一次）
```java
//开始同步调用组件，返回值为组件调用的结果对象（不管组件的实现方式为同步还是异步）
CCResult call() 
//开始执行异步调用，返回本次调用的callId，后续可以通过CC.cancel(callId)取消该次调用
String callAsync() 
//同上，支持设置一个回调对象，用于接收组件调用结果，callback.onResult在子线程运行
String callAsync(IComponentCallback callback) 
//同上，但callback.onResult方法在主线程运行
String callAsyncCallbackOnMainThread(IComponentCallback callback) 
```

### 获取CC对象中的参数
```java
//获取cc所调用的组件名称
String getComponentName() 
//CC.Builder构建时设置的context对象或者application对象
Context getContext() 
//CC.Builder构建时设置的组件调用的服务名称
String getActionName() 
//获取组件调用的参数列表，主要是CC.Builder设置的参数，可以被拦截器修改
Map<String, Object> getParams()
//获取通过setParamWithNoKey(param)设置的参数，通过泛型指定返回值的类型 
<T> T getParamItemWithNoKey() 
//同上，支持设置默认值（当没有找到参数时返回默认值）
<T> T getParamItemWithNoKey(T defaultValue) 
//根据key获取指定的参数，该值可能结果了拦截器的修改，通过泛型指定返回值的类型
<T> T getParamItem(String key) 
//同上，支持设置默认值
<T> T getParamItem(String key, T defaultValue) 
```

### 将组件调用结果发送给调用方
这个方法特别重要，组件的onCall方法被调用后，请确保在任何情况下都会调用下面的这个方法将当前组件调用的处理结果发送给调用方
参考[2. 创建组件][1] 中的第1.6节的相关介绍
```java
void sendCCResult(String callId, CCResult ccResult) 
```

### 其它非静态方法
```java
//获取本次组件调用的callId
String getCallId() 
//判断当前CC对象是否已经调用
boolean isStopped() 
//取消调用该组件,返回状态码为：-8
void cancel() 
```

### 其它静态方法
```java
//获取当前app的application对象，可被全局调用
Application getApplication() 

//取消指定callId对应的组件调用
void cancel(String callId) 

//获取当前app内是否含有指定名称的组件
boolean hasComponent(String componentName)

//向CC框架中注册一个动态组件对象
void registerComponent(IDynamicComponent component) 

//从CC框架中注销一个动态组件对象
void unregisterComponent(IDynamicComponent component) 

//注册一个全局拦截器,IGlobalCCInterceptor的实现类会被自动注册，
//若需要不自动注册，自己手动按需注册
//可定义一个IGlobalCCInterceptor的子接口，实现该接口的全局拦截器将不会自动注册
void registerGlobalInterceptor(IGlobalCCInterceptor interceptor) 

//注销一个全局拦截器（针对通过registerGlobalInterceptor注册的拦截器）
void unregisterGlobalInterceptor(IGlobalCCInterceptor interceptor) 

//获取当前是否设置了跨app调用，注意：正式发布前请确保关闭跨app调用
boolean isRemoteCCEnabled() 

//获取当前进程是否为主进程
boolean isMainProcess() 

//获取当前CC是否开启了debug模式
boolean isDebugMode() 
```


[1]: #/integration-create-component
