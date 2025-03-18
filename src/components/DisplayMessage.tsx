import { message } from "@/app/types/message";
import React from "react";
import MessageLoading from "./MessageLoading";

interface DisplayMessageProps {
  message: message;
  loading: boolean;
}

export default function DisplayMessage({
  message,
  loading,
}: DisplayMessageProps) {
  return (
    <div className="w-full my-2">
      {message.fromAI ? (
        <div className="flex justify-end">
          <div className="bg-primary text-white p-3 rounded-lg max-w-[70%]">
            {!loading ? (
              <p>{message.content}</p>
            ) : (
              <MessageLoading fromAI={true}></MessageLoading>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-start">
          <div className="bg-gray-200 p-3 rounded-lg max-w-[70%]">
            {!loading ? (
              <p>{message.content}</p>
            ) : (
              <MessageLoading fromAI={false}></MessageLoading>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
