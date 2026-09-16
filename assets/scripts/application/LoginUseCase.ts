import { Session } from "../domain/Session";
import { AuthPort } from "./ports/AuthPort";
import { NetworkPort } from "./ports/NetworkPort";
import { SessionStore } from "./SessionStore";

/** 第 2 层：怎么做完登录。不 import wx / cc。 */
export class LoginUseCase {
    constructor(
        private readonly auth: AuthPort,
        private readonly net: NetworkPort,
        private readonly store: SessionStore,
    ) {}

    async run(): Promise<Session> {
        const code = await this.auth.getLoginCode();
        const res = await this.net.request({
            url: "/login",
            method: "POST",
            body: { action: "login", code },
        });
        if (!res.ok) {
            throw new Error(res.error || "登录失败");
        }
        const openid = String(res.data.openid || "");
        const token = String(res.data.token || "");
        const session = new Session(openid, token);
        if (!session.isAuthenticated()) {
            throw new Error("登录结果缺少 openid/token");
        }
        this.store.set(session);
        return session;
    }
}
