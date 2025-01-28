import WebSocket from "ws";
import { EventEmitter } from "events";

interface ZigoxyClientOptions {
    serverHost: string;
    serverPort: number;
    localPort: number;
}

export class ZigoxyClient extends EventEmitter {
    private serverHost: string;
    private serverPort: number;
    private localPort: number;
    private controlSocket: WebSocket | null = null;

    constructor(options: ZigoxyClientOptions) {
        super();
        this.serverHost = options.serverHost;
        this.serverPort = options.serverPort;
        this.localPort = options.localPort;
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            const wsUrl = `ws://${this.serverHost}:${this.serverPort}?port=${this.localPort}`;
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
                        console.log(
                            `🔗 Access your service at: http://${message.subdomain}.localhost:${this.serverPort}`
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
