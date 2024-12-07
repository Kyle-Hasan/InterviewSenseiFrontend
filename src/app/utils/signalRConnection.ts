import * as signalR from "@microsoft/signalr";


export const startConnection = async (connectionUrl:string) => {
    const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5095"+connectionUrl) 
    .withAutomaticReconnect()
    .build();

    try {
        await connection.start();
        console.log("SignalR connected.");
    } catch (err) {
        console.error("SignalR connection failed:", err);
    }
    return connection
};

export default startConnection;