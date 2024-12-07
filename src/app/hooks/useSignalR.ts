import { useQueryClient } from "@tanstack/react-query";
import {startConnection} from "../utils/signalRConnection"
import { useEffect } from "react";

const useSignalR = (connectionUrl:string) => {
    const queryClient = useQueryClient();

    useEffect(() => {

        const setUpConnection = async ()=> {

        
        const connection = await startConnection(connectionUrl);

        connection.on("entitiesUpdated", (entityType:string, message) => {
            console.log(`Received Notification for ${entityType}: ${message}`);

            // Invalidate React Query cache for a specific entity type
            queryClient.invalidateQueries();
        });

        return () => {
            connection.off("ReceiveNotification");
        };
    }
    setUpConnection()
    }, [queryClient]);
};

export default useSignalR;