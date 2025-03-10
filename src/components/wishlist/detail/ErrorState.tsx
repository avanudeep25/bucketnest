
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  error: string;
  storeError?: string | null;
}

export const ErrorState = ({ error, storeError }: ErrorStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-12">
      <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
      <h2 className="text-2xl font-semibold mb-4">{error}</h2>
      <p className="text-gray-500 mb-6">
        The experience you're looking for could not be found or there was an error loading it.
      </p>
      {storeError && (
        <p className="text-red-500 mb-6">
          Error details: {storeError}
        </p>
      )}
      <Button className="mt-4" onClick={() => navigate("/wishlist")}>
        Go to My BucketNest
      </Button>
    </div>
  );
};
