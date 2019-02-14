## 类介绍：IActionProcessor.java

IActionProcessor是在CC源码工程下的demo中创建的一个接口，在CC框架中并没有这个类

接口定义如下：
```java
public interface IActionProcessor {

    /**
     * 指定所处理的actionName名称
     * @return 此actionProcessor处理的actionName
     */
    String getActionName();

    /**
     * action的处理类
     * @param cc cc
     * @return 是否异步调用 {@link CC#sendCCResult(String, CCResult)} . 
     *			true：异步， 
     *			false：同步调用
     */
    boolean onActionCall(CC cc);
}
```

这个接口解决的问题是：

	如果某个组件提供的服务比较多
	会导致onCall方法中写太多的actionName判断(if-else / switch-case)
	而且组件类中的代码会比较膨胀

为了更好地面向对象编程，在demo中给出了这个比较符合开闭原则的一种解决方案：

	定义一个接口，每个实现类提供一个actionName对应的组件服务
	利用cc-register的自动注册功能，将这个接口的实现类自动注册到组件类中
	当组件被调用时，根据actionName调用对应的IActionProcessor实现类对象

---

示例代码如下

```java
public class ComponentB implements IComponent {

    private AtomicBoolean initialized = new AtomicBoolean(false);
    private final HashMap<String, IActionProcessor> map = new HashMap<>();

    private void initProcessors() {
    	//cc-regsiter插件会自动生成注册代码在此处，如：
    	//add(new ShowLoginActivityProcessor())
    }

    private void add(IActionProcessor processor) {
        map.put(processor.getActionName(), processor);
    }

    @Override
    public String getName() {
        return "ComponentB";
    }

    @Override
    public boolean onCall(CC cc) {
        if (initialized.compareAndSet(false, true)) {
            synchronized (map) {
                initProcessors();
            }
        }
        String actionName = cc.getActionName();
        IActionProcessor processor = map.get(actionName);
        if (processor != null) {
            return processor.onActionCall(cc);
        }
        CC.sendCCResult(cc.getCallId(), CCResult.errorUnsupportedActionName());
        return false;
    }
}
```

其中一个跳转登录页面的actionProcessor代码如下：
```java
public class ShowLoginActivityProcessor implements IActionProcessor {
    @Override
    public String getActionName() {
        return "showActivity";
    }

    @Override
    public boolean onActionCall(CC cc) {
        CCUtil.navigateTo(cc, LoginActivity.class);
        CC.sendCCResult(cc.getCallId(), CCResult.success());
        return false;
    }
}
```

重要的一个步骤是：在根目录的`cc-settings-2.gradle`中添加自动注册的配置
```groovy
ccregister.registerInfo.add([
    //在自动注册组件的基础上增加：自动注册组件B的processor
    'scanInterface'             : 'com.billy.cc.demo.component.b.processor.IActionProcessor'
    , 'codeInsertToClassName'   : 'com.billy.cc.demo.component.b.ComponentB'
    , 'codeInsertToMethodName'  : 'initProcessors'
    , 'registerMethodName'      : 'add'
])
```

---

注意：如果有多个组件需要使用IActionProcessor方案，需要定义多个接口(或者一个接口的多个子接口),如：
```java
//组件A中的所有action处理类实现此接口
public interface IDemoAActionProcessor extends IActionProcessor {
	//nothing
}

//组件B中的所有action处理类实现此接口
public interface IDemoBActionProcessor extends IActionProcessor {
	//nothing
}

```
在`cc-settings-2.gradle`中对应地添加多个自动注册的配置
```groovy
ccregister.registerInfo.add([
    //IDemoAActionProcessor 接口
    'scanInterface'             : 'com.billy.cc.demo.component.a.processor.IDemoAActionProcessor'
    //注册到组件ComponentA中
    , 'codeInsertToClassName'   : 'com.billy.cc.demo.component.a.ComponentA'
    , 'codeInsertToMethodName'  : 'initProcessors'
    , 'registerMethodName'      : 'add'
])

ccregister.registerInfo.add([
    //IDemoBActionProcessor 接口
    'scanInterface'             : 'com.billy.cc.demo.component.b.processor.IDemoBActionProcessor'
    //注册到组件ComponentB中
    , 'codeInsertToClassName'   : 'com.billy.cc.demo.component.b.ComponentB'
    , 'codeInsertToMethodName'  : 'initProcessors'
    , 'registerMethodName'      : 'add'
])
```


