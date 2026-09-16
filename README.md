# Cocos Clean Architecture Demo

Cocos Creator **3.7.3** 空 2D 工程上的教科书四层切片：精简 **登录 + 支付**。

不拷贝 AladinSDK。用来看依赖朝里，不是用来上线。

## 四层对照

| 层 | 目录 | 本 demo |
|----|------|---------|
| 1 实体 | `assets/scripts/domain` | `Session.isAuthenticated()`、`PaymentOrder` 状态机 |
| 2 用例 | `assets/scripts/application` | `LoginUseCase`、`PayUseCase`，只依赖端口 |
| 3 适配器 | `assets/scripts/adapters` | Fake / SimulatedWeChat / 真 `wx` |
| 4 框架 | `assets/scripts/framework` | `AppConfig`、组合根、`DemoHud`（唯一 `import 'cc'`） |

依赖只许朝里：第 1、2 层没有 `wx`、没有 `cc`。

## 怎么跑

1. 用官网 **Cocos Creator 3.7.3** 打开本目录。
2. 预览 `assets/scene/main.scene`。
3. 按钮切换 Fake / SimWx / 真 wx；登录、支付、失败开关。
4. 内层测试（不启动引擎）：

```bash
npm test
```

微信构建后默认走真 `wx.login` / `wx.request`。`wx.request` 打的是可配置 echo：

`https://httpbin.org/post`（`assets/scripts/framework/config.ts`）

真机要把该域名加进微信后台 **request 合法域名**，否则会失败；预览 Fake 不受影响。

## 切片规则

- 未登录不能付
- 支付中不能再付
- 成功 / 失败各一条可点路径
- 换 Adapter 不改 `domain/`、`application/`
