## CC框架实践(2)：Fragment和View的组件化

### 一、需求背景

在android组件化过程中，你有没有遇到这样的问题：

- 单Activity + 多Fragment的架构下，如何进行Fragment的组件化？
- 主界面上的Fragment太多，想用组件化进行管理，该怎么做？
- 一个功能模块比较独立，但在主界面使用了其中一个Fragment，如何解耦？
- 对某些View进行了封装或者自定义的View，功能比较独立，是作为基础库通过类依赖使用好还是作为组件使用比较好？如果要作为组件使用，那要如何组件化？

### 二、现有的一些解决方案：

- 在主app中依赖所有组件，所以在主app中可直接使用这些组件中的Fragment或View的类
    - 直接使用具体的类将产生耦合，违背了组件化的解耦目的
    - 组件之间的fragment引用也需要直接依赖，这样就变成了一个库而非组件
- 使用ARouter来获取Fragment对象来实现Fragment组件化
    - 由于没有Fragment的具体类型，只能调用到系统中Fragment的public方法，不能进行业务通信
    - 由于View的创建需要用到Activity对象(用Application对象会导致Activity设置的Theme样式失效)，无法通过这种方式来获取
- 创建一个公共库，供所有组件依赖，所有组件在初始化时，将组件内的Fragment和View注册到公共库中生成一个映射表。组件通过调用公共库的映射表查找对应的Fragment或View的类
    - 跟用ARouter获取Fragment一样，在组件中无具体类型时无法进行业务通信
    - 如果要用于获取View，其构造方法的参数列表调用方需要了解，在一定程度上也属于类耦合
- 使用ARouter的获取Service方式实现，对外暴露服务，在公共库中定义接口，提供创建、业务通信相关的方法，在组件中实现此接口的具体功能，调用方通过动态获取接口实现类来调用业务功能。这种方式能实现Fragment和View的组件化调用和业务通信，实现的也比较优雅，但接口的管理成本有点高。
    - 接口放在公共库中，一般用以下2种方式实现：
        - 为每个向外提供Fragment或View的组件额外创建一个公共库，供需要调用的组件依赖（感觉好麻烦，还不如直接依赖组件...）
        - 所有组件的这些接口统一放在一个公共库中，供所有组件依赖。但这个库的维护成本就比较高了，每次有新的接口或者原接口新增/修改方法都要修改这个库。

### 三、在CC框架中如何实现Fragment的组件化？
CC的参数和回调结果使用的数据结构是Map，在app内部可以传递任何类型。

1. 通过CC调用获取组件中的Fragment对象

    1.1 组件调用方按如下方式调用，并从回调结果中获取Fragment，例如：
    ```java
    Fragment fragment = CC.obtainBuilder("ComponentName")
            .build().call().getDataItem("key");
    if (fragment != null) {
        //show fragment
    }
    ```

    1.2 组件实现方按如下方式设置结果，例如：
    ```java
    CC.sendCCResult(cc.getCallId(), CCResult.success("key", new MyFragment()));
    ```

2. 与Fragment进行通信
    
    组件化实施的主要目的之一是业务隔离：<b>只暴露调用协议给外部</b>(*类似于app端与服务端的通信接口*)，内部实现的更改对外部无影响。甚至组件的插拔和替换都不影响调用方(只要组件调用方做好组件调用失败的降级处理，例如1.1示例代码中的`if (fragment != null) {...}`。)
    
    所以，Fragment中的具体业务逻辑应由组件自身内部来实现，在组件调用方(如：Activity)中通过CC调用组件暴露的接口来完成。

    2.1 组件调用方将fragment对象及其它参数通过CC传递给组件，例如：
    ```java
    boolean success = CC.obtainBuilder("ComponentName")
        .setActionName("updateTextView") //action名称
        .addParam("fragment", fragment) //目标fragment对象
        .addParam("value", text) //设置参数
        .build().call().isSuccess();
    ```
    2.2 组件中接收fragment对象及其它参数，并调用fragment对象的指定方法实现对应的业务，例如：
    ```java
    @Override
    public boolean onCall(CC cc) {
        String actionName = cc.getActionName();
        if ("updateTextView".equals(actionName)) {
            MyFragment fragment = cc.getParamItem("fragment");//接收fragment对象
            if (fragment != null) {
                String text = cc.getParamItem("value", "");//接收其它参数
                fragment.updateText(text);//调用fragment的方法
                CC.sendCCResult(cc.getCallId(), CCResult.success());//回调结果
            } else {
                //回调错误信息
                CC.sendCCResult(cc.getCallId(), CCResult.error("no fragment params"));
            }
        }
        return false;
    }
    ```
    
### 五、 View有没有必要组件化？
答案是：对于一些封装过的View、自定义View(特别是第三方自定义View）是有必要的。

理由是：组件化能很好的解耦，将业务实现完全交给组件内部完成，只要接口协议不发生变化，实现方式发生改变时不会影响到使用方式。

网上很多组件化方案中，都是将自定义View(自己写的或者第三方库)作为公共库来使用。如果没有做个适配层(Adapter)而直接使用自定义View的类，将会导致View的耦合度很高，降低系统的扩展性。

## 六、在CC框架中如何实现View的组件化？

与Fragment组件化一样，通过CC获取对象和业务调用。

唯一的差别是：在获取View对象时需要将Activity对象传给组件

```java
View view = CC.obtainBuilder("ComponentName")
        .setContext(activity) //将activity对象传给组件，用于View的初始化
        .build().call().getDataItem("key");
if (view != null) {
    //add view to container
}
```

### 总结

关于android的组件化文章一般都只是介绍如何进行Activity的跳转及服务调用，对于Fragment的组件化一直没有很好的解决，View的组件化几乎没有被提到。

本文介绍了在CC组件化框架下实现Fragment及View组件化的方式，为android工程组件化的道路扫除一个障碍。
