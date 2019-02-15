## CC框架实践(4): 登录状态监听功能的实现

### 前言

在CC框架中，普通的组件调用类似于Http请求，是一对一的主动调用

但有时我们需要监听其它组件的某些状态，例如登录状态监听和下载进度监听

本文将以更为典型的登录状态监听为例来介绍如何在CC框架下实现此功能。

### 动态组件介绍

在CC架构下，实现`IDynamicComponent`接口的类就是动态组件

动态组件需要手动注册和注销

详细介绍请戳 [这里][1]

### 用动态组件来实现登录状态监听
按以下步骤实现即可
- 创建用于监听登录状态的动态组件
- 在登录组件新增2个服务：
    - 添加登录状态监听，接收动态组件的组件名称和action名称作为参数
    - 注销登录状态监听，接收动态组件的组件名称作为参数
- 在登录组件中，登录状态发生变化时通知所有正在监听的动态组件
- 将封装好的动态组件应用到BaseActivity/BaseFragment中
- 在BaseActivity/BaseFragment子类中使用登录状态功能，更便捷

示例代码如下：

**1. 创建监听登录状态的状态组件**
```java
/**
 * 监听登录状态的动态组件
 */
public class LoginObserverDyComponent implements IDynamicComponent, IMainThread {

    private static final String ACTION_REFRESH_STATUS = "refreshStatus";
    private String dynamicComponentName;
    private ILoginObserver loginObserver;
    private volatile boolean listening;

    public interface ILoginObserver {
        /**
         * 登录状态切换的回调
         * @param userId 登录用户的id，若为null则为未登录或退出登录
         */
        void refreshLoginUser(String userId);

        /**
         * refreshLoginUser(userId)方法是否在主线程运行
         * @return true:是，false:否
         */
        boolean isRefreshLoginUserRunOnMainThread();
    }

    public LoginObserverDyComponent(ILoginObserver observer) {
        this.loginObserver = observer;
        //为了确保动态组件类的多个不同的对象被准确调用到
        //每个组件对象的名称不重复
        dynamicComponentName = "login_observer_" + System.currentTimeMillis();
    }

    @Override
    public String getName() {
        return dynamicComponentName;
    }

    @Override
    public boolean onCall(CC cc) {
        String actionName = cc.getActionName();
        if (ACTION_REFRESH_STATUS.equals(actionName)) {
            String userId = cc.getParamItem(Login.KEY_USER_ID);
            final ILoginObserver listener = this.loginObserver;
            if (listener != null) {
                listener.refreshLoginUser(userId);
            }
        }
        CC.sendCCResult(cc.getCallId(), CCResult.success());
        return false;
    }

    @Override
    public Boolean shouldActionRunOnMainThread(String actionName, CC cc) {
        if (loginObserver != null) {
            return loginObserver.isRefreshLoginUserRunOnMainThread();
        }
        return null;
    }

    public void start() {
        if (listening) {
            return;
        }
        listening = true;
        //将自身注册到CC框架中
        CC.registerComponent(this);
        //将自身注册到登录组件的监听列表中
        CC.obtainBuilder(Login.NAME)
                .setActionName(Login.ACTION_ADD_LOGIN_OBSERVER)
                .addParam(Login.KEY_OBSERVER_COMPONENT_NAME, dynamicComponentName)
                .addParam(Login.KEY_OBSERVER_ACTION_NAME, ACTION_REFRESH_STATUS)
                .build().callAsync();
    }

    public void stop() {
        //将自身从登录组件的监听列表中移除
        CC.obtainBuilder(Login.NAME)
                .setActionName(Login.ACTION_DEL_LOGIN_OBSERVER)
                .addParam(Login.KEY_OBSERVER_COMPONENT_NAME, dynamicComponentName)
                .addParam(Login.KEY_OBSERVER_ACTION_NAME, ACTION_REFRESH_STATUS)
                .build().callAsync();
        //将自身从CC框架中注销
        CC.unregisterComponent(this);
        listening = false;
    }
}
```
**2. 在登录组件新增2个服务**
```java
public class LoginComponent implements IComponent {
    @Override
    public String getName() {
        return Login.NAME;
    }

    @Override
    public boolean onCall(CC cc) {
        String actionName = cc.getActionName();
        switch (actionName) {
            //other cases...
            case Login.ACTION_ADD_LOGIN_OBSERVER: return addLoginObserver(cc);
            case Login.ACTION_DEL_LOGIN_OBSERVER: return delLoginObserver(cc);
            default: CC.sendCCResult(cc.getCallId(), CCResult.errorUnsupportedActionName());
        }
        return false;
    }

    private boolean addLoginObserver(CC cc) {
        String dyComponentName = cc.getParamItem(Login.KEY_OBSERVER_COMPONENT_NAME);
        String dyActionName = cc.getParamItem(Login.KEY_OBSERVER_ACTION_NAME);
        if (!TextUtils.isEmpty(dyComponentName)) {
            LoginUserManager.addObserver(dyComponentName, dyActionName);
            CC.sendCCResult(cc.getCallId(), CCResult.success());
        } else {
            CC.sendCCResult(cc.getCallId(), CCResult.error("no componentName"));
        }
        return false;
    }

    private boolean delLoginObserver(CC cc) {
        String dyComponentName = cc.getParamItem(Login.KEY_OBSERVER_COMPONENT_NAME);
        if (!TextUtils.isEmpty(dyComponentName)) {
            LoginUserManager.delObserver(dyComponentName);
            CC.sendCCResult(cc.getCallId(), CCResult.success());
        } else {
            CC.sendCCResult(cc.getCallId(), CCResult.error("no componentName"));
        }
        return false;
    }
}

```
登录组件中的登录信息缓存管理类：

```java
public class LoginUserManager {
    /** 当前登录用户的id */
    private static String userId;

    private static final Map<String, String> LOGIN_OBSERVERS = new ConcurrentHashMap<>();

    /** 
     * 在登录组件中，登录状态改变时调用此方法更新登录用户信息
     * 同时将最新的用户信息发送给监听者
     */
    public static void refreshLoginUserId(String id) {
        userId = id;
        updateObservers();
    }

    static void addObserver(String componentName, String actionName) {
        if (TextUtils.isEmpty(componentName)) {
            return;
        }
        LOGIN_OBSERVERS.put(componentName, actionName);
        //动态组件在添加监听时立即发送一次当前用户id给它
        notifyObserver(componentName, actionName, userId);
    }

    /** 从监听列表中移除一个动态组件 */
    static void delObserver(String componentName) {
        if (TextUtils.isEmpty(componentName)) {
            return;
        }
        LOGIN_OBSERVERS.remove(componentName);
    }

    /** 将当前用户id发送给所有正在监听的动态组件 */
    private static void updateObservers() {
        Set<Map.Entry<String, String>> entries = LOGIN_OBSERVERS.entrySet();
        for (Map.Entry<String, String> entry : entries) {
            notifyObserver(entry.getKey(), entry.getValue(), userId);
        }
    }

    /** 将当前用户id发送给正在监听登录状态的动态组件 */
    private static void notifyObserver(String componentName, String actionName, String userId){
        if (TextUtils.isEmpty(componentName)) {
            return;
        }
        CC.obtainBuilder(componentName)
            .setActionName(actionName)
            .addParam(Login.KEY_USER_ID, userId)
            .build().callAsync();
    }
}
```

**3. 在登录组件中，登录状态发生变化时通知所有正在监听的动态组件**
```java
//登录状态改变时，调用以下代码来更新登录用户信息
//同时， 将最新的用户信息发送给监听者
LoginUserManager.refreshLoginUserId(newUserId);
```

**4. 将封装好的动态组件应用到BaseActivity/BaseFragment中**
```java
public class BaseActivity extends Activity implements LoginObserverDyComponent.ILoginObserver {

    private LoginObserverDyComponent loginObserverDyComponent;

    @Override
    protected void onDestroy() {
        super.onDestroy();
        //activity被销毁时
        // 如果监听了监听登录状态，需要注销对应的动态组件
        stopListenLoginState();
    }

    @Override
    public void refreshLoginUser(String userId) {
        //用户登录状态监听的回调
        //调用addLoginObserver()之后会立即获得一次当前登录用户id
        //若未登录，userId = null
        //若已登录，userId ≠ null
    }

    @Override
    public boolean isRefreshLoginUserRunOnMainThread() {
        //指定refreshLoginUser(userId)方法是否在主线程运行
        return false;
    }

    /**
     * 为当前activity添加登录状态监听
     * 通过{@link #refreshLoginUser(String)} 回调登录状态
     */
    protected void startListenLoginState() {
        if (loginObserverDyComponent == null) {
            loginObserverDyComponent = new LoginObserverDyComponent(this);
        }
        loginObserverDyComponent.start();
    }

    protected void stopListenLoginState() {
        if (loginObserverDyComponent != null) {
            loginObserverDyComponent.stop();
        }
    }
}
```

**5. 在子类中使用登录状态监听功能**

在子类中随时可以通过`startListenLoginState();`来开启登录状态监听

由于BaseActivity中在`onDestroy()`方法中已经注销了，所以子类中不需要处理注销
```java
public class HomeActivity extends BaseActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //开启登录状态监听
        startListenLoginState();
        //...
    }

    @Override
    public void refreshLoginUser(String userId) {
        //开启登录监听时和登录状态改变时会调用此方法
        //demo: 在主线程Toast当前userId
        boolean isLogin = userId != null;
        Toast.makeText(this, "userId=" + userId
                + ", isLogin=" + isLogin, Toast.LENGTH_SHORT).show();
    }

    @Override
    public boolean isRefreshLoginUserRunOnMainThread() {
        //指定refreshLoginUser方法在主线程运行
        return true;
    }
}
```




[1]: #/manual-IDynamicComponent