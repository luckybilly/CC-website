## 类介绍：CCResult.java

这个类的对象作为一次组件调用的最终执行结果返回给调用方

创建组件类(`IComponent`接口实现类)时，需要确保：在onCall方法每次被调用后，一定要通过`CC.sendCCResult(callId, ccResult)`将组件的执行结果返回给调用方
~~~
这一点是初学者必较容易忽视的，要尤其引起重视，Code Review时要重点检查
~~~

### 创建CCResult对象
可以通过构造方法来创建：
```java
CCResult result = new CCResult();
result.setSuccess(true);
result.setErrorMessage("");
result.addData("key", "value");
```
但这样写比较麻烦，为了减少反复写这些重复的代码，CCResult中提供了一些静态方法来快捷创建该对象：
```java
/**
 * 快捷构建一个CC调用成功的CCResult，只包含成功的状态，没有其它信息
 * success=true, code=0
 * 可以通过CCResult.addData(key, value)来继续添加更多的返回信息
 * @return 构造的CCResult对象
 */
public static CCResult success()
/**
 * 快捷构建一个CC调用成功的CCResult
 * success=true, code=0
 * 可以通过CCResult.addData(key, value)来继续添加更多的返回信息
 * @param key 存放在data中的key
 * @param value 存放在data中的value
 * @return 构造的CCResult对象
 */
public static CCResult success(String key, Object value)

/**
 * 快捷构建一个CC调用成功的CCResult
 * success=true, code=0
 * 可以通过CCResult.addData(key, value)来继续添加更多的返回信息
 * @param value 存放在data中的value
 * @return 构造的CCResult对象
 */
public static CCResult successWithNoKey(Object value)

/**
 * 快捷构建一个CC调用成功的CCResult
 * success=true, code=0
 * 可以通过CCResult.addData(key, value)来继续添加更多的返回信息
 * @param data 返回的信息
 * @return 构造的CCResult对象
 */
public static CCResult success(Map<String, Object> data)

/**
 * 构建一个CC调用到了组件，但业务失败的CCResult
 * success=false, code=1
 * 可以通过CCResult.addData(key, value)来继续添加更多的返回信息
 * @param message 错误信息
 * @return 构造的CCResult对象
 */
public static CCResult error(String message)

/**
 * 构建一个CC调用到了组件，但业务失败的CCResult，没有errorMessage
 * success=false, code=1
 * 可以通过CCResult.addData(key, value)来继续添加更多的返回信息
 * @param key 存放在data中的key
 * @param value 存放在data中的value
 * @return 构造的CCResult对象
 */
public static CCResult error(String key, Object value)

/**
 * 构建一个CC调用失败的CCResult：组件调用到了，但是该组件不能处理当前actionName
 * @return 构造的CCResult对象
 */
public static CCResult errorUnsupportedActionName()

```

项目中通常这样来创建一个CCResult对象：
```java
//成功
CCResult.success();
CCResult.successWithNoKey("value");
CCResult.success("key", "value");
CCResult.success("key1", "value1").addData("key2", "value2");
//失败
CCResult.error("some error message");
CCResult.error("some error message").addData("key", "value");
CCResult.error("key", "value");
CCResult.error("key1", "value1").addData("key2", "value2");
//在IComponent.onCall(cc)方法中通常还需要一个error来表明：此actionName所指定的服务暂未提供
CCResult.errorUnsupportedActionName();
```

### 从CCResult中提取信息

CCResult作为一次组件调用的结果，调用方需要从中提取组件调用是否成功等信息
```java
boolean isSuccess() //组件调用是否成功
String getErrorMessage() //错误信息
int getCode() //获取状态码
Map<String, Object> getDataMap() //获取返回的数据（以键值对的方式存储）
<T> T getDataItem(String key) //从data中取出key对应的value，泛型指定返回值的类型
<T> T getDataItem(String key, T defaultValue) //同上，如果数据为null，则返回默认值
<T> T getDataItemWithNoKey() //获取通过CCResult.successWithNoKey(value)返回的数据，泛型指定返回值的类型
<T> T getDataItemWithNoKey(T defaultValue) //同上，如果数据为null，则返回默认值
```





