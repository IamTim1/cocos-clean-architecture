import assert from "node:assert/strict";
import { test } from "node:test";
import { PaymentOrder } from "../assets/scripts/domain/PaymentOrder";
import { Session } from "../assets/scripts/domain/Session";
import { LoginUseCase } from "../assets/scripts/application/LoginUseCase";
import { PayUseCase } from "../assets/scripts/application/PayUseCase";
import { SessionStore } from "../assets/scripts/application/SessionStore";
import { FakeAuthAdapter } from "../assets/scripts/adapters/FakeAuthAdapter";
import { FakeNetworkAdapter } from "../assets/scripts/adapters/FakeNetworkAdapter";
import { SimulatedWeChatAuthAdapter } from "../assets/scripts/adapters/SimulatedWeChatAuthAdapter";
import { SimulatedWeChatNetworkAdapter } from "../assets/scripts/adapters/SimulatedWeChatNetworkAdapter";
import { AppComposition } from "../assets/scripts/framework/composition";

test("Session: 空对象不算已登录", () => {
    assert.equal(new Session("", "").isAuthenticated(), false);
    assert.equal(new Session("u1", "t1").isAuthenticated(), true);
});

test("PaymentOrder: 未开付不能标成功；支付中才能成功", () => {
    const order = new PaymentOrder("ord-1", 100);
    assert.equal(order.canStartPay(), true);
    assert.throws(() => order.markPaid());
    order.markPaying();
    assert.equal(order.canStartPay(), false);
    order.markPaid();
    assert.equal(order.getStatus(), "paid");
});

test("LoginUseCase + Fake: 成功写入 SessionStore", async () => {
    const store = new SessionStore();
    const login = new LoginUseCase(new FakeAuthAdapter(), new FakeNetworkAdapter(), store);
    const session = await login.run();
    assert.equal(session.openid, "fake-openid");
    assert.equal(store.get()?.token, "fake-token");
});

test("LoginUseCase + Fake: 失败路径", async () => {
    const net = new FakeNetworkAdapter();
    net.failNextLogin = true;
    const login = new LoginUseCase(new FakeAuthAdapter(), net, new SessionStore());
    await assert.rejects(() => login.run(), /登录失败/);
});

test("PayUseCase: 未登录不能付", async () => {
    const pay = new PayUseCase(new FakeNetworkAdapter(), new SessionStore());
    await assert.rejects(() => pay.run(100), /未登录/);
});

test("PayUseCase: 登录后支付成功", async () => {
    const store = new SessionStore();
    const net = new FakeNetworkAdapter();
    await new LoginUseCase(new FakeAuthAdapter(), net, store).run();
    const order = await new PayUseCase(net, store).run(100);
    assert.equal(order.getStatus(), "paid");
});

test("PayUseCase: 失败路径", async () => {
    const store = new SessionStore();
    const net = new FakeNetworkAdapter();
    await new LoginUseCase(new FakeAuthAdapter(), net, store).run();
    net.failNextPay = true;
    await assert.rejects(() => new PayUseCase(net, store).run(100), /支付失败/);
});

test("SimulatedWeChat: 同一套用例可换插头", async () => {
    const store = new SessionStore();
    const login = new LoginUseCase(new SimulatedWeChatAuthAdapter(), new SimulatedWeChatNetworkAdapter(), store);
    const session = await login.run();
    assert.ok(session.isAuthenticated());
    assert.match(session.openid, /^wx-echo-/);
});

test("组合根切换 Adapter 不改 Session 实体类", () => {
    const app = new AppComposition("fake");
    app.switchKind("simulated-wechat");
    assert.equal(app.kind, "simulated-wechat");
    assert.equal(app.store.get(), null);
});
