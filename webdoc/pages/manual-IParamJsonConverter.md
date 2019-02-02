## 类介绍: IParamJsonConverter.java

json转换工具接口

在跨进程调用时，自定义类型如果未实现Parcelable和Serializable，需要转换成json进行传递。

为了不限定用户选用何种json序列化框架（Jackson、FastJson、Gson等），就不在框架层面添加额外的第三方框架依赖了

将序列化方案的选择权交给用户，只需要创建一个`IParamJsonConverter`接口的实现类即可，cc-register插件会在编译期间找到这个实现类并自动注入到`RemoteParamUtil`中

注：因为组件都有独立运行调试的需求，跨进程参数传递需要用IParamJsonConverter的实现类，建议将它和[全局拦截器][1]一起放在公共库中

```java
public interface IParamJsonConverter {

    /**
     * 将json字符串转换为对象
     * @param json json字符串
     * @param clazz 类型
     * @param <T> 泛型
     * @return json转换的对象
     */
    <T> T json2Object(String json, Class<T> clazz);

    /**
     * Object to json
     *
     * @param instance 要跨app传递的对象
     * @return json字符串
     */
    String object2Json(Object instance);
}
```

[1]: #/manual-IGlobalCCInterceptor