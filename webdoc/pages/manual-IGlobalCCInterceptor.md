## 类介绍: IGlobalInterceptor.java


### 什么是"全局"拦截器，与"普通"拦截器的区别是什么？

区别于"普通"拦截器需要在构建CC对象时通过`ccBuilder.addInterceptor(interceptor)`进行添加，全局拦截器会自动注册到`GlobalCCInterceptorManager`中进行管理

区别于"普通"拦截器只对本次组件调用有效，全局拦截器将作用于每一次组件调用

~~~
注：如果在构建CC对象时设置了ccBuilder.withoutGlobalInterceptor()，那本次组件调用将不会执行所有全局拦截器
~~~

区别于"普通"拦截器是根据添加的顺序来决定执行的顺序，全局拦截器在实现类中需要为其指定优先级

```java
//全局拦截器接口继承了普通拦截器接口
public interface IGlobalCCInterceptor extends ICCInterceptor {
    /**
     * 优先级，(可重复,相同的优先级其执行顺序将得不到保障)
     * @return 全局拦截器的优先级，按从大到小的顺序执行
     */
    int priority();
}
```

### 动态注册/注销全局拦截器

直接实现IGlobalInterceptor接口的全局拦截器会被cc-register插件自动注册到`GlobalCCInterceptorManager`中进行管理

如果您的某个全局拦截器需要自己指定注册/注销时机，可创建一个IGlobalInterceptor的子接口类，然后再实现该子接口来创建全局拦截器。这样，就不会在编译阶段被自动注册到`GlobalCCInterceptorManager`中去了。然后可以通过以下代码来动态地注册/注销它：
```java
//注册一个全局拦截器到CC框架中
CC.registerGlobalInterceptor(IGlobalCCInterceptor interceptor) 
//注销一个全局拦截器
CC.unregisterGlobalInterceptor(IGlobalCCInterceptor interceptor) 
```

### 调用组件时禁用全局拦截器
```java
CC.obtainBuilder("componentName")
	.setActionName("actionName")
	.withoutGlobalInterceptor()	//禁用所有全局拦截器
	.addInterceptor(new MyInterceptor()) //禁用全局拦截器的同时，可以添加普通拦截器
	.build()
	.callAsync();
```
 
### 注意事项

为了防止开发阶段跨app（或app内部跨进程）调用组件时全局拦截器重复执行，全局拦截器应全部放在公共库中，供所有组件依赖，
 
跨app（或app内部跨进程）调用组件时，只会在调用方所在进程中执行全局拦截器，被调用方所在进程的全局拦截器不执行（`withoutGlobalInterceptor()`）



