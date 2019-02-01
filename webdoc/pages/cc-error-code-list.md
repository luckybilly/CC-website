## CCResult状态码清单


| 状态码        | 说明    |
| --------   | :----- |
| 0 | CC调用成功 |
| 1 | CC调用成功，但业务逻辑判定为失败 |
| -1 | 保留状态码：默认的请求错误code |
| -2 | 没有指定组件名称 |
| -3 | result不该为null。例如：组件回调时使用 CC.sendCCResult(callId, null) 或 interceptor返回null |
| -4 | 调用过程中出现exception，请查看logcat |
| -5 | 指定的ComponentName没有找到 |
| -6 | context为null，获取application失败，出现这种情况可以用CC.init(application)来初始化 |
| -7 | (@Deprecated 从2.0.0版本开始废弃)跨app调用组件时，LocalSocket连接出错 |
| -8 | 已取消 |
| -9 | 已超时 |
| -10 | component.onCall(cc) return false, 未调用CC.sendCCResult(callId, ccResult)方法 |
| -11 | 跨app组件调用时对象传输出错，可能是自定义类型没有共用，请查看Logcat |
| -12 | 组件不支持该actionName。在IComponent.onCall(cc)方法中通过CCResult.errorUnsupportedActionName()来返回该error,参考[ComponentB][1] |


[1]: https://github.com/luckybilly/CC/blob/master/demo_component_b/src/main/java/com/billy/cc/demo/component/b/ComponentB.java#L62