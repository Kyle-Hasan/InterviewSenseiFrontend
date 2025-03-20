import { interviewFeedback } from '@/app/types/interviewFeedback';
import React from 'react';
import Spinner from './Spinner';

interface FeedbackTabProps {
  feedback: interviewFeedback | null;
  loadingFeedback:boolean;
}

export default function FeedbackTab({ feedback, loadingFeedback }: FeedbackTabProps) {
  if (loadingFeedback) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-bold mb-4 text-center">Feedback</h2>

      {feedback ? (
        <>
          <div>
            <h2>Positive Feedback</h2>
            <p>{feedback.postiveFeedback || "No positive feedback available."}</p>
          </div>

          <div>
            <h2>Negative Feedback</h2>
            <p>{feedback.negativeFeedback || "No negative feedback available."}</p>
          </div>
        </>
      ) : (
        <p>Feedback is not available.</p>
      )}
    </div>
  );
}
