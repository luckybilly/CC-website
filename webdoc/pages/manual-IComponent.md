## 类介绍: IComponent.java

组件的接口类，通过创建这个接口的实现类来创建一个组件

### 组件类的作用

站在CC的视角，组件是一个个组件类(IComponent接口的实现类)，而不是一个个module，module只是存放组件类的地方，在组件类中可直接调用到module中的其它代码而已。

例如：一个module中有多个组件类，在CC看来就是多个组件

CC的每一次组件调用，针对的是一个对应的组件类，不管这个组件类在哪个module中、也不管在哪个进程（App）中

```java
/**
 * 组件接口
 * 注意：
 *      1. 此接口的实现类代表的是一个组件暴露给外部调用的入口
 *      2. 实现类必须含有一个无参构造方法，以供自动注册插件进行代码注入
 *      3. 实现类有且只有一个对象会被注册到组件库中，故不能为Activity、Fragment等(可以改用动态组件注册{@link IDynamicComponent})
 * @author billy.qi
 */
public interface IComponent {

    /**
     * 定义组件名称
     * @return 组件的名称
     */
    String getName();

    /**
     * 调用此组件时执行的方法（此方法只在LocalCCInterceptor中被调用）
     * 注：执行完成后必须调用CC.sendCCResult(callId, CCResult.success(result));
     * cc.getContext() android的context
     * cc.getAction() 调用的action
     * cc.getParams() 调用参数
     * cc.getCallId() 调用id，用于取消调用
     * @param cc 调用信息
     * @return 是否延迟回调结果 {@link CC#sendCCResult(String, CCResult)}
     *          false:否(同步实现，在return之前回调结果)
     *          true:是(异步实现，本次CC调用将等待回调结果)
     */
    boolean onCall(CC cc);
}
```

