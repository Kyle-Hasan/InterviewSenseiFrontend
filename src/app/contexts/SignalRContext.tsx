import React, { createContext, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";


interface SignalRContextType {
    createConnection: (hubUrl: string, connectionKey: string) => Promise<signalR.HubConnection | null>;
    disconnectConnection: (connectionKey: string) => Promise<void>;
    disconnectAllConnections: () => Promise<void>;
    connections: Map<string, signalR.HubConnection>;
}

const SignalRContext = createContext<SignalRContextType | null>(null);

export const SignalRProvider = ({ children }: {children:React.ReactNode}) => {
    const connectionsRef = useRef(new Map()); 
    const queryClient = useQueryClient()

    
    const createConnection = async (hubUrl:string, connectionKey:string) => {
        if (!hubUrl || !connectionKey) {
            console.error("Hub URL and connection key are required to create a connection.");
            return null;
        }

        if (connectionsRef.current.has(connectionKey)) {
            console.log(`Connection for key "${connectionKey}" already exists.`);
            return connectionsRef.current.get(connectionKey);
        }

        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5095"+hubUrl)
            .withAutomaticReconnect()
            .build();

        connection.onclose((error) => {
            console.log(`SignalR connection for "${connectionKey}" closed.`, error);
        });

        try {
            await connection.start();
            connection.on("entitiesUpdated", (entityType, message) => {
                console.log(`Received Notification for ${entityType}: ${message}`);
                queryClient.invalidateQueries({queryKey:[entityType]});
            });
            connectionsRef.current.set(connectionKey, connection); 
        } catch (err) {
            console.error(`Failed to connect to SignalR hub (${hubUrl}):`, err);
        }

        return connection;
    };

   
    const disconnectConnection = async (connectionKey:string) => {
        if (!connectionsRef.current.has(connectionKey)) {
            console.warn(`No connection found for key "${connectionKey}".`);
            return;
        }

        const connection = connectionsRef.current.get(connectionKey);
        try {
            await connection.stop();
            console.log(`Connection for key "${connectionKey}" stopped.`);
            connectionsRef.current.delete(connectionKey);
        } catch (err) {
            console.error(`Error stopping connection for key "${connectionKey}":`, err);
        }
    };

   
    const disconnectAllConnections = async () => {
        for (const [key, connection] of connectionsRef.current.entries()) {
            try {
                await connection.stop();
                console.log(`Connection for key "${key}" stopped.`);
            } catch (err) {
                console.error(`Error stopping connection for key "${key}":`, err);
            }
        }
        connectionsRef.current.clear();
    };

    return (
        <SignalRContext.Provider
            value={{
                createConnection,
                disconnectConnection,
                disconnectAllConnections,
                connections: connectionsRef.current,
            }}
        >
            {children}
        </SignalRContext.Provider>
    );
};

export default SignalRContext;