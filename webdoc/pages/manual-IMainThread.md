## 类介绍: IMainThread.java

IComponent的辅助接口类，组件类额外实现此接口可以自主指定onCall方法在不同actionName调用时是否在主线程运行

~~~
默认情况下：
	调用方在主线程同步调用组件时，被调用的组件onCall方法在主线程运行。
	调用方在子线程同步调用组件时，被调用的组件onCall方法在调用方所在线程运行
	调用方异步调用组件时，被调用的组件onCall方法在CC线程池中的子线程运行
~~~

接口定义如下：
```java
public interface IMainThread {
    /**
     * 根据当前actionName确定组件的{@link IComponent#onCall(CC)} 方法是否在主线程运行
     * @param actionName 当前CC的action名称
     * @param cc 当前CC对象
     * @return 3种返回值: 
     *              null:默认状态，不固定运行的线程（在主线程同步调用时在主线程运行，其它情况下在子线程运行）
     *              true:固定在主线程运行
     *              false:固定子线程运行
     */
    Boolean shouldActionRunOnMainThread(String actionName, CC cc);
}
```
举个例子：

假设有一个数据提供的组件

actionName=getDataById的实现代码中同步调用了网络请求功能，由于网络请求功能必须在子线程运行，需要指定该action被调用时onCall方法在子线程运行

actionName=showMsg的实现代码中调用了Toast，必须在主线程运行，需要指定该action被调用时onCall方法在主线程运行

示例代码如下：

```java
public class DataComponent implements IComponent, IMainThread {
    private static final String COMPONENT_NAME = "component_data";
    private static final String ACTION_GET_DATA_BY_ID = "getDataById";
    private static final String ACTION_SHOW_MSG = "showMsg";

    @Override
    public String getName() {
        return COMPONENT_NAME;
    }

    @Override
    public boolean onCall(CC cc) {
        String actionName = cc.getActionName();
        if (ACTION_GET_DATA_BY_ID.equals(actionName)) {
            return getDataById(cc);
        } else if (ACTION_SHOW_MSG.equals(actionName)) {
            return showMsg(cc);
        }
        CC.sendCCResult(cc.getCallId(), CCResult.errorUnsupportedActionName());
        return false;
    }

    private boolean getDataById(CC cc) {
        String id = cc.getParamItem("id");
        //在进入此处时，当前线程一定为子线程（是在shouldActionRunOnMainThread方法中指定的）
        String retrunJson = NetworkUtil.queryDataById(id);
        CC.sendCCResult(cc.getCallId(), CCResult.successWithNoKey(retrunJson));
        //同步实现的action，return false
        return false;
    }

    private boolean showMsg(CC cc) {
        String msg = cc.getParamItem("msg");
        if (!TextUtils.isEmpty(msg)) {
        	//在进入此处时，当前线程一定为主线程（是在shouldActionRunOnMainThread方法中指定的）
            Toast.makeText(MainActivity.this, "msg", Toast.LENGTH_SHORT).show();
            CC.sendCCResult(cc.getCallId(), CCResult.success());
        } else {
            CC.sendCCResult(cc.getCallId(), CCResult.error("message is empty"));
        }
        return false;
    }

    @Override
    public Boolean shouldActionRunOnMainThread(String actionName, CC cc) {
        if (ACTION_GET_DATA_BY_ID.equals(actionName)) {
            //指定ACTION_GET_DATA_BY_ID被调用时，onCall方法在子线程运行
            return false;
        } else if (ACTION_SHOW_MSG.equals(actionName)) {
            //指定ACTION_SHOW_MSG被调用时，onCall方法在主线程运行
            return true;
        }
        //其它action保持默认状态
        return null;
    }
}
```





