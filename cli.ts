#!/usr/bin/env node
import { ZigoxyClient } from "./client";

const usage = `
Usage: zigoxy <local-port>

Example: 
  zigoxy 8080     # Exposes localhost:8080 via zigoxy server
`;

const cli = async () => {
    const localPort = parseInt(process.argv[2]);

    if (!localPort || isNaN(localPort)) {
        console.error("Error: Please provide a valid port number");
        console.log(usage);
        process.exit(1);
    }

    const client = new ZigoxyClient({
        serverHost: process.env.ZIGOXY_SERVER_HOST || "localhost",
        serverPort: parseInt(process.env.ZIGOXY_SERVER_PORT || "3000"),
        localPort: localPort,
    });

    try {
        await client.connect();

        process.on("SIGINT", () => {
            console.log("\n👋 Shutting down zigoxy client...");
            client.disconnect();
            process.exit(0);
        });
    } catch (err) {
        console.error("❌ Failed to connect:", err);
        process.exit(1);
    }
};

cli();
