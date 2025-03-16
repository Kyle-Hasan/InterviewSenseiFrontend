import { message } from '@/app/types/message';
import React from 'react';

interface DisplayMessageProps {
  message: message;
}

export default function DisplayMessage({ message }: DisplayMessageProps) {
  return (
    <div className="w-full my-2">
      {message.fromAI ? (
        <div className="flex justify-end">
          <div className="bg-primary text-white p-3 rounded-lg max-w-[70%]">
            <p>{message.content}</p>
          </div>
        </div>
      ) : (
        <div className="flex justify-start">
          <div className="bg-gray-200 p-3 rounded-lg max-w-[70%]">
            <p>{message.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}