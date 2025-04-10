import { env } from 'env.js';
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

class Hub {
    constructor(pathName) {
        this.connection = null;
        this.reconnectGroupData = {};
        if (pathName) {
            const url = pathName.startsWith('/') ? `${env.REACT_APP_PANACEACHS_SERVER}${pathName}` : pathName;
            this.connection = new HubConnectionBuilder()
                .withUrl(url)
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();
            this.connection.onreconnected(() => {
                const { eventName, data } = this.reconnectGroupData;
                if (eventName) {
                    this.connection.invoke(eventName, ...data);
                }
            });
        }
    }
    async start() {
        if (this.connection?.connectionState === 'Connected') {
            await this.stop();
        }
        if (this.connection?.connectionState === 'Disconnected') {
            return await this.connection?.start();
        }
    }
    on(eventName, callback) {
        this.connection?.off(eventName);
        this.connection?.on(eventName, callback);
    }
    async reconnect() {
        return await this.connection?.reconnect();
    }
    async invoke(eventName, ...data) {
        return await this.connection?.invoke(eventName, ...data);
    }
    async stop() {
        return await this.connection?.stop();
    }
    async joinGroup(eventName, ...data) {
        this.reconnectGroupData.eventName = eventName;
        this.reconnectGroupData.data = data;
        return await this.connection?.invoke(eventName, ...data);
    }
}
export default Hub;