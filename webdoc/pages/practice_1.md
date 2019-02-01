## CC框架实践(1)：实现登录成功再进入目标界面

CC框架基因中自带支持组件层面的AOP，在定义组件时，实现IComponent.onCall(cc)方法，并根据cc中的参数来执行组件中的具体逻辑（如：页面跳转等）。

可以在调用具体逻辑之前对该功能进行AOP实现，例如：登录、页面数据预加载等

### 用CC框架实现必须先登录再进入目标页面功能

目标页面所在的组件在执行页面跳转前调用登录组件(用户中心组件)获取用户信息，若未登录则登录后返回用户信息。

    这里有2个点：
    1. 若用户已登录，则直接返回用户信息，同步方式实现即可
    2. 若用户未登录，则跳转到登录页面，需要执行完登录操作(或取消)后才能获得结果，使用异步方式实现。
    
以打开订单列表页面前需要登录为例：
1. 先定义用户组件，提供一个强制获取用户登录信息的功能，若未登录则打开登录界面，并在用户登录后返回登录结果(取消登录也是一种结果)

```java
//用户中心组件类
public class UserComponent implements IComponent {
    @Override
    public String getName() {
        return "demo.component.user";
    }

    @Override
    public boolean onCall(CC cc) {
        String actionName = cc.getActionName();
        // ... 
        // 强制获取用户信息，若未登录则跳转到登录，并将登录结果返回
        if ("forceGetLoginUser".equals(actionName)) {
            if (!TextUtils.isEmpty(Global.loginUserName)) {
                //已登录同步实现，直接调用CC.sendCCResult(...)并返回返回false
                CCResult result = CCResult.success(Global.KEY_USERNAME, Global.loginUserName);
                CC.sendCCResult(cc.getCallId(), result);
                return false;
            }
            //未登录，打开登录界面，在登录完成后再回调结果，异步实现
            Context context = cc.getContext();
            Intent intent = new Intent(context, LoginActivity.class);
            if (!(context instanceof Activity)) {
                //调用方没有设置context或app间组件跳转，context为application
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            }
            //将cc的callId传给Activity，登录完成后通过这个callId来回传结果
            intent.putExtra("callId", cc.getCallId());
            context.startActivity(intent);
            //异步实现，不立即调用CC.sendCCResult,返回true
            return true;
        }
        //...
        return false;
    }

}
```
2. 模拟的登录页面：点击按钮模拟登录，直接返回文本框中的信息作为登录成功的信息，若未登录直接返回，则视为取消登录
```java
/**
 * 模拟登录页面
 */
public class LoginActivity extends AppCompatActivity implements View.OnClickListener {

    private EditText editText;
    private String callId;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.id.activity_login);
        callId = intent.getStringExtra("callId");
        //init views
    }

    @Override
    public void onClick(View v) {
        //模拟登录：点击按钮获取文本框内容并作为用户登录信息返回
        String username = editText.getText().toString().trim();
        if (TextUtils.isEmpty(username)) {
            Toast.makeText(this, R.string.demo_b_username_hint, Toast.LENGTH_SHORT).show();
        } else {
            //登录成功，返回
            Global.loginUserName = username;
            finish();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        //判断是否为CC调用打开本页面
        if (callId != null) {
            CCResult result;
            if (TextUtils.isEmpty(Global.loginUserName)) {
                result = CCResult.error("login canceled");
            } else {
                result = CCResult.success(Global.KEY_USERNAME, Global.loginUserName);
            }
            //为确保不管登录成功与否都会调用CC.sendCCResult，在onDestroy方法中调用
            CC.sendCCResult(callId, result);
        }
    }
}
```

3. 在订单组件中进行登录验证：登录成功，则跳转到订单列表页；登录失败，则返回调用失败的结果

```java
//订单组件
public class OrderComponent implements IComponent {
    @Override
    public String getName() {
        return "demo.component.order";
    }

    @Override
    public boolean onCall(CC cc) {
        CCResult result = CC.obtainBuilder("demo.component.user")
                .setActionName("forceGetLoginUser")
                .build()
                .call();
        CCResult ccResult;
        // 根据登录状态决定是否打开页面
        // 这里也可以添加更多的前置判断逻辑
        if (result.isSuccess()) {
            ccResult = CCResult.success();
            //登录成功，打开目标页面
            startOrderListActivity(cc);
        } else {
            //登录失败，返回失败信息
            ccResult = result;
        }
        //调用方不需要获得额外的信息，只需要知道调用状态
        //所以这个组件采用同步实现：同步调用CC.sendCCResult(...) 并且返回false
        CC.sendCCResult(cc.getCallId(), ccResult);
        return false;
    }

    private void startOrderListActivity(CC cc) {
        Context context = cc.getContext();
        Intent intent = new Intent(context, OrderListActivity.class);
        if (!(context instanceof Activity)) {
            // context maybe an application object if caller dose not setContext
            // or call across apps
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        }
        context.startActivity(intent);
    }
}
```

至此，打开订单页面必须登录的功能已全部完成。

## 这样实现的好处

1. 登录组件只管登录自身的逻辑，跟其它逻辑完全不耦合
2. 调用订单组件的地方无需添加额外的代码
3. 可以添加任意的前置条件判断
4. 登录条件的判断可用于任意组件而无需修改登录组件的逻辑
5. 支持跨app组件调用时的前置条件判断


