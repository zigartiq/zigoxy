import WebSocket from "ws";
import { EventEmitter } from "events";

interface ZigoxyClientOptions {
    serverHost: string;
    serverPort: number;
    localPort: number;
    secure?: boolean;
}

export class ZigoxyClient extends EventEmitter {
    private serverHost: string;
    private serverPort: number;
    private localPort: number;
    private secure: boolean;
    private controlSocket: WebSocket | null = null;

    constructor(options: ZigoxyClientOptions) {
        super();
        this.serverHost = options.serverHost;
        this.serverPort = options.serverPort;
        this.localPort = options.localPort;
        this.secure = options.secure ?? false;
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const protocol = this.secure ? "wss" : "ws";
            const wsUrl = `${protocol}://${this.serverHost}:${this.serverPort}?port=${this.localPort}`;
            this.controlSocket = new WebSocket(wsUrl);

            this.controlSocket.on("open", () => {
                console.log("Connected to zigoxy server");
                resolve();
            });

            this.controlSocket.on("message", (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    if (message.subdomain) {
                        console.log(`✨ Tunnel created!`);
                        const domain = message.domain || `${message.subdomain}.${this.serverHost}`;
                        const protocol = this.secure ? "https" : "http";
                        const portSuffix = this.secure
                            ? this.serverPort !== 443
                                ? `:${this.serverPort}`
                                : ""
                            : this.serverPort !== 80
                            ? `:${this.serverPort}`
                            : "";
                        console.log(
                            `🔗 Access your service at: ${protocol}://${domain}${portSuffix}`
                        );
                    }
                } catch (err) {
                    console.error("Failed to parse server message:", err);
                }
            });

            this.controlSocket.on("error", (err) => {
                console.error("Control socket error:", err);
                reject(err);
            });

            this.controlSocket.on("close", () => {
                console.log("Disconnected from zigoxy server");
            });
        });
    }

    disconnect() {
        if (this.controlSocket) {
            this.controlSocket.close();
            this.controlSocket = null;
        }
    }
}
