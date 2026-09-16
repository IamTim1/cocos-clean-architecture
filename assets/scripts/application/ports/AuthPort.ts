/** 第 2 层定义的端口：只要登录凭证，不要 wx.login。 */
export interface AuthPort {
    getLoginCode(): Promise<string>;
}
