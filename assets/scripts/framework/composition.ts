import { FakeAuthAdapter } from "../adapters/FakeAuthAdapter";
import { FakeNetworkAdapter } from "../adapters/FakeNetworkAdapter";
import { SimulatedWeChatAuthAdapter } from "../adapters/SimulatedWeChatAuthAdapter";
import { SimulatedWeChatNetworkAdapter } from "../adapters/SimulatedWeChatNetworkAdapter";
import { WechatAuthAdapter } from "../adapters/WechatAuthAdapter";
import { WechatNetworkAdapter } from "../adapters/WechatNetworkAdapter";
import { LoginUseCase } from "../application/LoginUseCase";
import { PayUseCase } from "../application/PayUseCase";
import { AuthPort } from "../application/ports/AuthPort";
import { NetworkPort } from "../application/ports/NetworkPort";
import { SessionStore } from "../application/SessionStore";
import { AppConfig } from "./config";

export type AdapterKind = "fake" | "simulated-wechat" | "wechat";

export function hasRealWx(): boolean {
    const wx = (globalThis as { wx?: { login?: Function; request?: Function } }).wx;
    return !!(wx && typeof wx.login === "function" && typeof wx.request === "function");
}

export function defaultKind(): AdapterKind {
    return hasRealWx() ? "wechat" : "fake";
}

/** 第 4 层组合根：唯一有权点名「今天用哪套插头」的地方。 */
export class AppComposition {
    readonly store = new SessionStore();
    readonly fakeNet = new FakeNetworkAdapter();
    readonly fakeAuth = new FakeAuthAdapter();

    kind: AdapterKind;
    login: LoginUseCase;
    pay: PayUseCase;

    constructor(kind: AdapterKind = defaultKind()) {
        this.kind = kind;
        this.login = this.buildLogin(kind);
        this.pay = new PayUseCase(this.pickNet(kind), this.store);
    }

    switchKind(kind: AdapterKind): void {
        this.kind = kind;
        this.login = this.buildLogin(kind);
        this.pay = new PayUseCase(this.pickNet(kind), this.store);
    }

    private pickAuth(kind: AdapterKind): AuthPort {
        if (kind === "wechat") return new WechatAuthAdapter();
        if (kind === "simulated-wechat") return new SimulatedWeChatAuthAdapter();
        return this.fakeAuth;
    }

    private pickNet(kind: AdapterKind): NetworkPort {
        if (kind === "wechat") return new WechatNetworkAdapter(AppConfig.apiBaseUrl);
        if (kind === "simulated-wechat") return new SimulatedWeChatNetworkAdapter();
        return this.fakeNet;
    }

    private buildLogin(kind: AdapterKind): LoginUseCase {
        return new LoginUseCase(this.pickAuth(kind), this.pickNet(kind), this.store);
    }
}
