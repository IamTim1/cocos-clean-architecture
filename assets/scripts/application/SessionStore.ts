import { Session } from "../domain/Session";

/** 应用内存里的当前会话，不是实体。 */
export class SessionStore {
    private current: Session | null = null;

    get(): Session | null {
        return this.current;
    }

    set(session: Session): void {
        this.current = session;
    }

    clear(): void {
        this.current = null;
    }
}
