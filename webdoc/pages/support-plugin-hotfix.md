## 支持热修复、插件化及aar打包

CC框架本身跟插件化和热修复没有什么关联

但是，为了实现代码隔离，通过addComponent添加到主app module的组件，只有在特定的gradle命令下才会真正添加到依赖列表中

```java
//需要集成打包相关的task
static final String TASK_TYPES = ".*((((ASSEMBLE)|(BUILD)|(INSTALL)|((BUILD)?TINKER)|(RESGUARD)).*)|(ASR)|(ASD))"
```

按照上面的这个正则表达式，只有在打apk包和tinker补丁包的时候才会真正将组件添加到依赖列表

### 用ccMain来指定集成打包的module名称

cc-register插件从 1.0.8 版本开始，提供了一种新的方式来兼容其它热修复框架和插件化框架

在打包命令中加上参数来指定当前为哪个module集成打包，如果设置了此值，则会忽略上面的正则表达式：
```groovy
//格式为：./gradlew  :$moduleName:$taskName -PccMain=$assembleBuildModuleName
./gradlew :demo:xxxBuildPatch -PccMain=demo //用某插件化框架脚本为demo打补丁包
```

这个参数还有另一个功能： 

### 为组件module打aar包

cc-register 1.0.7及之前的所有版本，为组件打aar包需要在local.properties中添加设置：
```properties
assemble_aar_for_cc_component=true #设置后，组件module的assemble命令将打出aar包
```

因为这种方式在打aar包之前和之后都要手动修改`local.properties`文件，容易出错

cc-register 1.0.8开始，可以通过在gradle打包命令中加上ccMain=noModule来实现打aar包的功能
```groovy
//为demo_component_b打aar包
./gradlew :demo_component_b:assembleRelease -PccMain=noModule 
```
为了向下兼容， 仍然保留`assemble_aar_for_cc_component`的作用
