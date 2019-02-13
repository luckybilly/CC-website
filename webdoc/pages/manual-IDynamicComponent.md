## 类介绍: IDynamicComponent.java

动态组件

### 定义

区别于静态组件(IComponent)编译时自动注册到ComponentManager中，动态组件则不会自动注册，需要手动注册/注销
1. 动态组件需要实现接口: IDynamicComponent
2. 需要手动调用 CC.registerComponent(component) , 类似于BroadcastReceiver动态注册
3. 需要手动调用 CC.unregisterComponent(component), 类似于BroadcastReceiver动态反注册
4. 其它用法跟静态组件一样

接口定义
```java
public interface IDynamicComponent extends IComponent {
}
```
可以看到IDynamicComponent继承了IComponent，其功能与IComponent一样，差别仅仅是不会被自动注册

那么...
### 动态组件的存在有什么意义呢？

静态组件会在编译时代码扫描生成注册代码，在第一次执行CC调用之前就会被初始化

并且在CC框架的视角中，它们是单例的，只会在初始化的时候创建静态组件对象

在以下这些情况下将不适用：

- activity、fragment等自有生命周期的对象




##### 4.3 动态组件在注册它的进程中运行

动态组件不支持`@SubProcess`及`@AllProcess`注解

例如：在主进程中调用`CC.registerComponent(dynamicComponent);`,dynamicComponent将在主进程中运行
    
