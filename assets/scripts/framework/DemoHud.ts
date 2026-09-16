import {
    _decorator,
    Button,
    Color,
    Component,
    Label,
    Node,
    UITransform,
    Vec3,
    view,
} from "cc";
import { AppComposition, AdapterKind } from "./composition";

const { ccclass } = _decorator;

@ccclass("DemoHud")
export class DemoHud extends Component {
    private app = new AppComposition();
    private statusLabel: Label = null!;
    private logLabel: Label = null!;
    private lines: string[] = [];

    start() {
        this.buildUi();
        this.log(`启动 Adapter=${this.app.kind}（微信包默认真 wx，否则 Fake）`);
        this.refreshStatus();
    }

    private buildUi() {
        const size = view.getDesignResolutionSize();
        const w = size.width || 720;
        const h = size.height || 1280;

        this.statusLabel = this.makeLabel("status", new Vec3(0, h * 0.38, 0), w - 40, 160, 22);
        this.logLabel = this.makeLabel("log", new Vec3(0, -h * 0.28, 0), w - 40, 420, 18);

        const y0 = h * 0.18;
        const gap = 72;
        this.makeBtn("登录", 0, y0, () => this.onLogin());
        this.makeBtn("支付 1 元", 0, y0 - gap, () => this.onPay());
        this.makeBtn("下次登录失败", 0, y0 - gap * 2, () => {
            this.app.fakeAuth.failNext = true;
            this.app.fakeNet.failNextLogin = true;
            this.log("已设置：下一次 Fake 登录失败");
        });
        this.makeBtn("下次支付失败", 0, y0 - gap * 3, () => {
            this.app.fakeNet.failNextPay = true;
            this.log("已设置：下一次 Fake 支付失败");
        });
        this.makeBtn("Adapter: Fake", -200, y0 - gap * 4, () => this.onSwitch("fake"));
        this.makeBtn("Adapter: SimWx", 0, y0 - gap * 4, () => this.onSwitch("simulated-wechat"));
        this.makeBtn("Adapter: 真wx", 200, y0 - gap * 4, () => this.onSwitch("wechat"));
    }

    private async onLogin() {
        try {
            const session = await this.app.login.run();
            this.log(`登录成功 openid=${session.openid}`);
        } catch (e) {
            this.log(`登录失败: ${this.err(e)}`);
        }
        this.refreshStatus();
    }

    private async onPay() {
        try {
            const order = await this.app.pay.run(100);
            this.log(`支付成功 order=${order.id} status=${order.getStatus()}`);
        } catch (e) {
            this.log(`支付失败: ${this.err(e)}`);
        }
        this.refreshStatus();
    }

    private onSwitch(kind: AdapterKind) {
        this.app.switchKind(kind);
        this.log(`已切换 Adapter=${kind}（第 1/2 层未改）`);
        this.refreshStatus();
    }

    private refreshStatus() {
        const s = this.app.store.get();
        const sessionText = s && s.isAuthenticated() ? `已登录 ${s.openid}` : "未登录";
        this.statusLabel.string =
            `Clean Architecture Demo\n` +
            `Adapter: ${this.app.kind}\n` +
            `Session: ${sessionText}\n` +
            `支付中: ${this.app.pay.isPaying() ? "是" : "否"}`;
    }

    private log(msg: string) {
        const line = `[${this.now()}] ${msg}`;
        this.lines.push(line);
        if (this.lines.length > 14) this.lines.shift();
        this.logLabel.string = this.lines.join("\n");
        console.log(line);
    }

    private now(): string {
        const d = new Date();
        const p = (n: number) => (n < 10 ? "0" + n : "" + n);
        return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    }

    private err(e: unknown): string {
        return e instanceof Error ? e.message : String(e);
    }

    private makeLabel(name: string, pos: Vec3, width: number, height: number, fontSize: number): Label {
        const node = new Node(name);
        node.setParent(this.node);
        node.setPosition(pos);
        const ui = node.addComponent(UITransform);
        ui.setContentSize(width, height);
        const label = node.addComponent(Label);
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 6;
        label.overflow = Label.Overflow.CLAMP;
        label.horizontalAlign = Label.HorizontalAlign.LEFT;
        label.verticalAlign = Label.VerticalAlign.TOP;
        label.color = Color.WHITE;
        label.enableWrapText = true;
        label.string = "";
        return label;
    }

    private makeBtn(title: string, x: number, y: number, onClick: () => void) {
        const node = new Node(title);
        node.setParent(this.node);
        node.setPosition(x, y, 0);
        const ui = node.addComponent(UITransform);
        ui.setContentSize(180, 56);
        const label = node.addComponent(Label);
        label.string = title;
        label.fontSize = 20;
        label.color = Color.YELLOW;
        const btn = node.addComponent(Button);
        btn.transition = Button.Transition.SCALE;
        node.on(Button.EventType.CLICK, onClick, this);
        return btn;
    }
}
