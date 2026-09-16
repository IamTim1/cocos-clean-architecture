/** 第 1 层：实体。换渠道仍成立：有没有一份有效登录态。 */
export class Session {
    constructor(
        public readonly openid: string,
        public readonly token: string,
    ) {}

    isAuthenticated(): boolean {
        return this.openid.length > 0 && this.token.length > 0;
    }
}
