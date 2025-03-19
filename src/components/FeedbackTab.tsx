import { interviewFeedback } from '@/app/types/interviewFeedback';
import React from 'react';

interface FeedbackTabProps {
  feedback: interviewFeedback | null;
}

export default function FeedbackTab({ feedback }: FeedbackTabProps) {
  return (
    <div className="flex flex-col gap-5">
         <h2 className="text-xl font-bold mb-4 text-center">Feedback</h2>
      {feedback ? (
        <>
          {feedback.postiveFeedback ? (
            <div>
              <h2>Positive Feedback</h2>
              <p>{feedback.postiveFeedback}</p>
            </div>
          ) : (
            <div>
              <h2>Positive Feedback</h2>
              <p>No positive feedback available.</p>
            </div>
          )}

          {feedback.negativeFeedback ? (
            <div>
              <h2>Negative Feedback</h2>
              <p>{feedback.negativeFeedback}</p>
            </div>
          ) : (
            <div>
              <h2>Negative Feedback</h2>
              <p>No negative feedback available.</p>
            </div>
          )}
        </>
      ) : (
        <p>Feedback is not available.</p>
      )}

    </div>
  );
}