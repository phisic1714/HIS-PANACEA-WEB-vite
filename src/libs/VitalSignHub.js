import { HttpTransportType, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { env } from '../env';

class VitalSignHub {
  constructor(pathName, accessToken = null) {
    this.connection = null;
    this.reconnectGroupData = {};
    this.isStarting = false;
    this.accessToken = accessToken;

    if (pathName) {
      const url = pathName.startsWith('/')
        ? `${env.REACT_APP_PANACEACHS_SERVER}${pathName}`
        : pathName;
      this.connection = new HubConnectionBuilder()
        .withUrl(url, {
          transport: HttpTransportType.WebSockets,
          accessTokenFactory: () => this.accessToken || this.getAccessToken(),
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      this.connection.onreconnected(() => {
        const { eventName, data } = this.reconnectGroupData;
        if (eventName) {
          this.invoke(eventName, ...data).catch(err =>
            console.error("Error during re-invocation:", err)
          );
        }
      });

      this.connection.onclose(error => {
        console.warn("Connection closed:", error);
      });
    }
  }

  getAccessToken() {
    return localStorage.getItem('token');
  }

  async start(retries = 10, delay = 1500) {
    if (this.isStarting || this.connection?.state === 'Connected') {
      return;
    }

    this.isStarting = true;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (this.connection?.state === 'Disconnected') {
          await this.connection.start();
          console.info(`Connection started successfully on attempt ${attempt}.`);
          break; // Exit loop if successful
        }
      } catch (error) {
        console.error(`Error starting connection (Attempt ${attempt}/${retries}):`, error);

        if (attempt < retries) {
          console.info(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          console.error("Failed to start connection after multiple attempts.");
        }
      }
    }

    this.isStarting = false;
  }
  on(eventName, callback) {
    this.connection?.off(eventName);
    this.connection?.on(eventName, callback);
  }

  async reconnect() {
    try {
      await this.connection?.start();
      console.info("Reconnected successfully.");
    } catch (error) {
      console.error("Error reconnecting:", error);
    }
  }

  async invoke(eventName, ...data) {
    try {
      return await this.connection?.invoke(eventName, ...data);
    } catch (error) {
      console.error(`Error invoking ${eventName}:`, error);
    }
  }

  async stop() {
    try {
      await this.connection?.stop();
      console.info("Connection stopped successfully.");
    } catch (error) {
      console.error("Error stopping connection:", error);
    }
  }

  async joinGroup(eventName, ...data) {
    this.reconnectGroupData = { eventName, data };
    try {
      return await this.invoke(eventName, ...data);
    } catch (error) {
      console.error(`Error joining group with ${eventName}:`, error);
    }
  }
}

export default VitalSignHub;
