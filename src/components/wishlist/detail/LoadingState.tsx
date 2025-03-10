
import { RotateCw } from "lucide-react";

interface LoadingStateProps {
  attempt: number;
}

export const LoadingState = ({ attempt }: LoadingStateProps) => (
  <div className="text-center py-12">
    <RotateCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
    <h2 className="text-2xl font-semibold">Loading experience...</h2>
    <p className="text-gray-500 mt-2">Attempt {attempt + 1} of 3</p>
    {attempt >= 2 && (
      <div className="mt-4 max-w-md mx-auto text-amber-600 text-sm">
        <p>Taking longer than expected. We're still trying to load your experience.</p>
        <p className="mt-1">This might be due to network issues or because this experience is new.</p>
      </div>
    )}
  </div>
);
