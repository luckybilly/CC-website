## 集成CC step2:创建组件
---
## 一、新业务、新建module

### 1.1 在Android Studio中新建module

二选一：Phone & Tablet Module 或 Android Library
 
### 1.2 在该module下的build.gradle中添加对cc-settings-2.gradle文件的依赖
将原来的
```groovy
apply plugin: 'com.android.library'
//或
apply plugin: 'com.android.application'
```
替换成
```groovy
apply from: rootProject.file('cc-settings-2.gradle')
```

### 1.3 继续修改此build.gradle文件，将applicationId去除或者按以下方式修改，否则在集成打包时会报错
 ```groovy
android {
    defaultConfig {
        //仅在以application方式编译时才添加applicationId属性
        if (project.ext.runAsApp) { 
            applicationId 'com.billy.cc.demo.component.a'
        }
        //...
    }
    //...
}
```

### 1.4 创建组件module的debug目录

__若不需要单独运行该组件module，可跳过此步骤__

debug目录将只在组件module作为application单独运行时才生效，作为library被打包到主app中或者单独打aar包时会自动排除debug目录下的代码和资源，对正式代码无污染

- 将Android Studio的导航切换到"Project"模式
- 在module/src/main文件夹上点右键 -> 新建Directory，并命名为debug
- 继续在debug文件夹上通过右键新建Directory的方式在debug文件夹下创建2个文件夹：java和res
- 将module/src/main/AndroidManifest.xml文件复制到module/src/main/debug/AndroidManifest.xml
- 点击工具栏上的Sync按钮
- 在module/src/main/debug/java文件夹右键，创建com.billy.debug.DebugApplication.java
    ```java
    public class DebugApplication extends Application {
        @Override
        public void onCreate() {
            super.onCreate();
            CC.enableDebug(BuildConfig.DEBUG);
            CC.enableVerboseLog(BuildConfig.DEBUG);
            CC.enableRemoteCC(BuildConfig.DEBUG);
        }
    }
    ```
- 在module/src/main/debug/java文件夹右键，创建com.billy.debug.DebugActivity.java
    ```java
    public class DebugActivity extends AppCompatActivity {
        @Override
        protected void onCreate(@Nullable Bundle savedInstanceState) {
            super.onCreate(savedInstanceState);
            Toast.makeText(this, "hello CC", Toast.LENGTH_SHORT).show();
            //需要单独安装运行，但不需要入口页面（只需要从主app中调用此组件）时，
            // 可直接finish当前activity
            finish();
        }
    }
    ```
- 将DebugApplication注册到module/src/main/debug/AndroidManifest.xml的application节点
- 将DebugActivity注册到module/src/main/debug/AndroidManifest.xml的application节点下，并设置为launcherActivity
    ```xml
    <manifest xmlns:android="http://schemas.android.com/apk/res/android"
        package="com.billy.android.component.user">
        <application
            android:name="com.billy.debug.DebugApplication"
            android:icon="@mipmap/ic_launcher"
            android:label="@string/app_name"
            android:theme="@style/AppTheme" >
            <activity android:name="com.billy.debug.DebugActivity" >
                <intent-filter>
                    <action android:name="android.intent.action.MAIN"/>
                    <category android:name="android.intent.category.LAUNCHER" />
                </intent-filter>
            </activity>
        </application>
    </manifest>
    ```
---
至此，组件module已创建完成，（若组件需要独立运行，并且不希望测试代码混在正式代码中，建议完成第4步）

### 1.5 在主app module中按如下方式添加对组件module的依赖

注意：组件之间不要互相依赖

```groovy
ext.mainApp = true //标记为主app module
apply from: rootProject.file('cc-settings-2.gradle')
//...

dependencies {
    addComponent 'demo_component_a' //会默认添加依赖：project(':demo_component_a')
    addComponent 'demo_component_kt', project(':demo_component_kt') //module方式
    addComponent 'demo_component_b', 'com.billy.demo:demo_b:1.1.0'  //maven方式
}
```

按照此方式添加的依赖有以下特点：

- 方便：组件切换library和application方式编译时，只需在local.properties中进行设置，不需要修改app module中的依赖列表
    - 运行主app module时会自动将【设置为以app方式编译的组件module】从依赖列表中排除
- 安全：避免调试时切换library和application方式修改主app中的依赖项被误提交到代码仓库，导致jenkins集成打包时功能缺失
- 隔离：避免直接调用组件中的代码及资源


### 1.6 创建组件类，向外暴露当前组件提供的服务
新建一个类实现<a href="https://github.com/luckybilly/CC/blob/master/cc/src/main/java/com/billy/cc/core/component/IComponent.java" target="_blank">IComponent</a>接口即可


```java
public class ComponentA implements IComponent {
  @Override
  public String getName() {
      //指定组件的名称
      return "ComponentA";
  }
  @Override
  public boolean onCall(CC cc) {
    String actionName = cc.getActionName();
    switch (actionName) {
      case "showActivity": //响应actionName为"showActivity"的组件调用
        //跳转到页面：ActivityA
        CCUtil.navigateTo(cc, ActivityA.class);
        //返回处理结果给调用方
        CC.sendCCResult(cc.getCallId(), CCResult.success());
        //同步方式实现（在return之前听过CC.sendCCResult()返回组件调用结果），return false
        return false;
      default:
        //其它actionName当前组件暂时不能响应，可以通过如下方式返回状态码为-12的CCResult给调用方
        CC.sendCCResult(cc.getCallId(), CCResult.errorUnsupportedActionName());
        return false;
    }
  }
}
```
创建组件类的注意事项：

- 需要保留无参构造方法
- 组件名称需要具备唯一性
- actionName为组件向外暴露的服务名称，多个服务在onCall方法中用actionName区分，执行不同的处理逻辑
- onCall方法的返回值是有特殊意义的，要慎重对待
    ~~~
    true: 异步实现
        onCall方法执行完成后，CC框架会等待组件在未来的某个时间点调用CC.sendCCResult(callId, result)返回本次组件调用结果
    false: 同步实现
        在return之前调用CC.sendCCResult(callId, result)返回本次组件调用结果，否则系统会返回-10的状态码给调用方
    ~~~
- <font color=red>不管是同步实现还是异步实现，每次onCall被调用后，必须调用CC.sendCCResult(callId, result)将调用结果发送给调用方</font>
    - 要确保在任何逻辑分支下都会调用，例如：if-elseif-else, try-catch-finally, activity被关闭导致服务中断等
    - 原理是：对于外部来说组件相当于黑盒，每次调用都需要有一个调用结果返回
    - <font color=red>这一点是许多初学者容易忽视的，需要足够重视，code review时建议重点检查</font>

- 如果某个逻辑分支上没有调用到CC.sendCCResult发送本次调用的结果，将导致：  
    - onCall方法返回true：
        - 调用方是同步调用：
            - 未设置超时时间：本次调用将耗时2秒后返回超时，状态码：-9
            - 设置了超时时间且大于0：本次调用将在设置的超时时间后返回超时，状态码：-9
            - 设置了超时时间为0：本次调用所在的线程将block在此处不得释放
        - 调用方是异步调用：
            - 未设置超时时间：本次调用的回调函数将不会被调用，并且CC的线程池被永久地占用掉了1个。并且每次都会占用1个线程，直至资源耗尽。
            - 已设置超时时间且大于0：本次调用将在设置的超时时间后调用回调函数，返回超时，状态码：-9
    - onCall方法返回false：
        - 不管调用方如何调用，将接收到CC框架返回的调用结果，状态码：-10

至此，您已经学会如何创建一个新的组件module了。

---
如果你负责的项目是一个正在迭代维护中的老项目，那接下来就请了解一下如何在不修改现有代码的前提下为已有的功能创建组件类供外部调用。

## 二、老业务，新建组件类

### 2.1 在该module下的build.gradle中添加对cc-settings-2.gradle文件的依赖
将原来的
```groovy
apply plugin: 'com.android.library'
//或
apply plugin: 'com.android.application'
```
替换成
```groovy
ext.mainApp = true //如果此module为主app module，则启用这一行
//ext.alwaysLib = true //如果此module原来是一个library，被其它module所依赖，则启用这一行
//以上2行根据具体情况启用其中一行
apply from: rootProject.file('cc-settings-2.gradle')
```
或者
```groovy
//ext.mainApp = true //如果此module为主app module，则启用这一行
ext.alwaysLib = true //如果此module原来是一个library，被其它module所依赖，则启用这一行
//以上2行根据具体情况启用其中一行
apply from: rootProject.file('cc-settings-2.gradle')
```

### 2.2 创建组件类，向外暴露当前组件提供的服务

创建组件类的方式与章节 1.5 相同，不再赘述

该组件类暴露的服务与单独组件module中的组件类功能一样，所以解耦并不是必须的。

如果老业务module中按业务模块划分应该被分为多个组件，可创建多个组件类，其对外暴露服务的效果等同于多个组件module

只是，到此为止，组件还未解耦和代码隔离，所以尚不能独立运行调试

### 2.3 老业务module解耦成独立组件

这一步不是必须的，更不是马上就必须要做的，实际上，老项目的组件化改造是一个相当漫长的过程。

将组件从原module中解耦出去时，可参照新业务新module创建组件的方式，将老组件里的代码连同步骤2.2中创建的组件类一起解耦出去

解耦前后对其它组件无影响，所以，这个解耦过程可以利用业务迭代过程中的碎片空闲时间一步步来完成，尽量不占用大片连续时间。




[1]: https://github.com/luckybilly/CC/blob/master/cc/src/main/java/com/billy/cc/core/component/IComponent.java
[2]: https://bintray.com/hellobilly/android/cc-register/_latestVersion
[3]: https://api.bintray.com/packages/hellobilly/android/cc/images/download.svg
[4]: https://bintray.com/hellobilly/android/cc/_latestVersion
[5]: https://github.com/luckybilly/CC/blob/master/cc-settings-2.gradle




