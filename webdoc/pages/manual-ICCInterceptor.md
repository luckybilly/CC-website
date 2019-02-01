## 类介绍：ICCInterceptor.java

拦截器

### 什么是拦截器？

自定义拦截器(`ICCInterceptor`)实现原理

- 所有拦截器按顺序存放在调用链(Chain)中
- 先按照优先级执行所有用户自定义全局拦截器(`ICCGlobalInterceptor`接口实现类)
- 再按照发起CC调用时添加的顺序执行用户自定义拦截器(`ICCInterceptor`接口实现类)
- 然后执行CC框架自身的拦截器`ValidateInterceptor`
- `ValidateInterceptor`将在app内部查找目标组件，根据查找结果添加具体执行调用的拦截器`LocalCCInterceptor`（或`SubProcessCCInterceptor`、`RemoteCCInterceptor`)和`Wait4ResultInterceptor` 
- Chain类负责依次执行所有拦截器`interceptor.intercept(chain)`
- 拦截器`intercept(chain)`方法通过调用`Chain.proceed()`方法获取CCResult
  
<img width="100%" src="https://github.com/luckybilly/CC/raw/dev_multiprocess/image/sst/sst_cc_interceptors.png" />


### 用户自定义拦截器

用户自定义拦截器分为2种类型：
- 普通拦截器（对一次组件调用生效的拦截器），直接实现`ICCInterceptor`接口
- 全局拦截器（对所有组件调用都生效的拦截器），实现`IGlobalCCInterceptor`接口

本页只介绍普通拦截器，全局拦截器请点击[这里][1]

```java
public interface ICCInterceptor {
    /**
     * 拦截器方法
     * chain.getCC() 来获取cc对象
     * 调用chain.proceed()来传递调用链
     * 也可通过不调用chain.proceed()来中止调用链的传递
     * 通过cc.getParams()等方法来获取参数信息，并可以修改params
     * @param chain 链条
     * @return 调用结果
     */
    CCResult intercept(Chain chain);
}
```

用户可在自定义的拦截器中对组件调用进行拦截：
- 调用前可修改调用参数（例如：在网络请求组件被调用之前进行参数签名&加密）
- 调用后可修改返回数据（例如：在网络请求组件调用完成后对返回的数据进行验签&解密）
- 中止执行本次组件调用（例如：进行一些合法性校验，未通过校验时不执行组件调用）

### 添加拦截器

```java
CC.obtainBuilder("componentName")
	.setActionName("actionName")
	.addInterceptor(new MyInterceptor())
	.build()
	.call();
```


[1]: #/manual-IGlobalCCInterceptor