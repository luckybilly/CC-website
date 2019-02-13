## 类介绍：BaseForwardInterceptor.java


### 定义

作为一个抽象类（实现了拦截器接口:ICCInterceptor），供开发者继承，用于定义组件调用转发规则


```java
public abstract class BaseForwardInterceptor implements ICCInterceptor {
    /**
     * 根据当前组件调用对象获取需要转发到的组件名称
     * @param cc 当前组件调用对象
     * @param componentName 当前调用的组件名称
     * @return 转发的目标组件名称（为null则不执行转发）
     */
    protected abstract String shouldForwardCC(CC cc, String componentName);

    @Override
    public CCResult intercept(Chain chain) {
        CC cc = chain.getCC();
        String forwardComponentName = shouldForwardCC(cc, cc.getComponentName());
        if (!TextUtils.isEmpty(forwardComponentName)) {
            cc.forwardTo(forwardComponentName);
        }
        return chain.proceed();
    }
}
```

### 如何使用

子类需通过实现`String shouldForwardCC(CC cc, String componentName)`方法在执行组件调用前拦截，指定是否需要进行转发

如果需要做成全局拦截器，子类需要额外实现[IGlobalCCInterceptor][1]接口

### 作用1：组件灰度发布

例如，原有一个首页组件(componentName为"HomeComponent")

现在改版了，新创建一个组件(componentName为"HomeComponentNew"，暴露的服务协议不变)

希望可以通过服务端控制灰度，可以这样做：

	将2个组件都集成到app中
	创建一个BaseForwardInterceptor的子类(HomeGrayInterceptor)
	HomeGrayInterceptor 再实现 IGlobalCCInterceptor 接口，将其定义成为一个全局拦截器
	在启动页请求服务端的灰度配置
	HomeGrayInterceptor中根据灰度配置来决定是否需要转发：
		如果需要灰度到新版首页，在shouldForwardCC方法中返回"HomeComponentNew"
		如果不需要灰度，在shouldForwardCC方法中返回null
	
示例代码如下：
```java
public class HomeGrayInterceptor extends BaseForwardInterceptor implements IGlobalCCInterceptor {
    //当前设备&用户是否为灰度用户
    public static boolean grayToNewHome = false;
    
    @Override
    protected String shouldForwardCC(CC cc, String componentName) {
        if (grayToNewHome && "HomeComponent".equals(componentName)) {
            //如果有需要，也可以在此处修改参数
            Map<String, Object> params = cc.getParams();
            return "HomeComponentNew";
        }
        return null;
    }

    @Override
    public int priority() {
    	//定义一个app内所有全局拦截器中比较高的优先级以便尽早拦截
        return 9999;
    }
}
```

### 作用2：服务降级

如果某个组件有明显的故障，可在服务端进行配置，对该组件实施降级处理

	常见的降级方式有：
	  未发布新版本：跳转到对应的h5页面
	  已发布新版本：提示老版本用户升级App

示例代码如下：

```java
public class DowngradeInterceptor extends BaseForwardInterceptor implements IGlobalCCInterceptor {
    //服务端下发的降级策略
    public static Map<String, String> forwards = null;
    
    @Override
    protected String shouldForwardCC(CC cc, String componentName) {
        if (forwards != null) {
            String forwardTo = forwards.get(componentName);
            //如果配置了服务降级策略,进行转发
            if (!TextUtils.isEmpty(forwardTo)) {
            	//如果有需要，也可以在此处修改参数
                Map<String, Object> params = cc.getParams();
                return forwardTo;
            }
        }
        return null;
    }

    @Override
    public int priority() {
        return 9999;
    }
}
```


[1]: #/manual-IGlobalCCInterceptor