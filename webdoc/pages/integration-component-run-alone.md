## 组件独立运行调试

按照[集成组件化开发环境][1]和[创建组件][2]中的步骤创建好组件module后，组件应该就具备独立运行调试的功能了

### 1. 安装运行组件module

在Android Studio工具栏上选择要运行的组件module，并点击绿色Run按钮运行该组件，组件module将以application方式编译打包运行

如果报`Default Activity Not Found`的错导致不能编译，其原因是没有设置Launch Activity，解决的办法有：

1)为该module设置不需要Launch Activity，[参考文章][3]

2)在src/main/debug/AndroidManifest.xml中设置一个Launch Activity，例如：
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

### 2. 将组件module从主app中排除

由于CC会优先调用app内部的组件，只有在内部找不到对应组件且设置了`CC.enableRemoteCC(true)`时才会尝试进行跨app组件调用。

所以，单组件以app运行调试时，如果主app要主动与此组件进行通信，请确保主app中没有包含此组件，做法为：

在工程根目录的`local.properties`中添加如下配置，并重新打包运行主app
```properties
module_name=true #module_name为具体每个module的名称，设置为true代表从主app的依赖列表中排除该组件module
```



[1]: #/integration
[2]: #/integration-create-component
[3]: https://blog.csdn.net/Liuhe_5656/article/details/79843222
[4]: #/integration
[5]: #/integration-create-component
[6]: #/integration-call-component