## 类介绍: IComponent.java

组件的接口类，通过创建这个接口的实现类来创建一个组件

### 组件类(IComponent接口的实现类)的作用

站在CC的视角，组件是一个个组件类，而不是一个个module，module只是存放组件类的容器，在组件类中可直接调用到module中的功能代码而已。

例如：一个module中有多个组件类，在CC看来就是多个组件

CC的每一次组件调用，针对的是一个对应的组件类，不管这个组件类在哪个module中、也不管在哪个进程（或App）中

组件类对于组件来说，它起到的作用是：

    组件module创建组件类来定义它将向外提供哪些服务(服务名称：actionName)以及如何提供这些服务(参数及返回值协议)

### IComponent接口的定义


__注：请特别注意onCall方法返回值的说明（初学者容易忽视，Code Review时请重点检查）__

```java
/**
 * 组件接口
 * 注意：
 *   1. 此接口的实现类代表的是一个组件暴露给外部调用的入口
 *   2. 实现类必须含有一个无参构造方法，以供自动注册插件进行代码注入
 *   3. 实现类有且只有一个对象会被注册到组件库中，故不能为Activity、Fragment等
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
     * cc.getContext() android的context，在组件被跨进程调用时，返回application对象
     * cc.getAction() 调用的action
     * cc.getParams() 调用参数
     * cc.getCallId() 调用id，用于通过CC向调用方发送调用结果
     * @param cc 调用信息
     * @return 是否延迟回调结果 {@link CC#sendCCResult(String callId, CCResult result)}
     *          false:否(同步实现，在return之前回调结果)
     *          true:是(异步实现，本次CC调用将等待回调结果)
     */
    boolean onCall(CC cc);
}
```

### 创建组件类

组件类（静态组件类）需要直接实现IComponent接口，具体创建方式及注意事项请参考[2. 创建组件][1]

动态组件类需要实现IDynamicComponent接口，具体说明请戳[这里][2]

### 自定义Base基类

直接实现IComponent接口(注意：是直接实现）的组件类会自动注册到ComponentManager中进行管理


**如果需要自定义一个基类**

请在你根目录下的`cc-settings-2.gradle`文件中添加以下代码，并修改其中`scanSuperClasses`的类名：

注意：如果基类不是抽象的(abstract)，也会被视作一个组件类被自动注册到ComponentManager中进行管理

```groovy
//自动注册组件
ccregister.registerInfo.add([ 
  'scanInterface'             : 'com.billy.cc.core.component.IComponent'
  //改成你的基类名称，可以有多个，用英文逗号隔开
  , 'scanSuperClasses'        : ['your.pkg.YourBaseComponent', 'your.pkg.YourBaseComponent2'] 
  , 'codeInsertToClassName'   : 'com.billy.cc.core.component.ComponentManager'
  , 'registerMethodName'      : 'registerComponent'
  //排除的类，支持正则表达式（包分隔符需要用/表示，不能用.）
  , 'exclude'                 : [ 'com.billy.cc.core.component.'.replaceAll("\\.", "/") + ".*" ]
])
```

未完待续。。。




[1]: #/integration-create-component
[2]: #/manual-IDynamicComponent
