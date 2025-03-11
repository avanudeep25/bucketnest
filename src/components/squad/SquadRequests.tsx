
import { useState, useEffect } from "react";
import { useUserStore, SquadRequest } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { CheckIcon, XIcon } from "lucide-react";

const SquadRequests = () => {
  const { getSquadRequestsReceived, respondToSquadRequest } = useUserStore();
  const [pendingRequests, setPendingRequests] = useState<SquadRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState<Record<string, boolean>>({});

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await getSquadRequestsReceived();
      setPendingRequests(requests);
    } catch (error) {
      console.error("Error loading squad requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [getSquadRequestsReceived]);

  const handleRespond = async (requestId: string, accept: boolean) => {
    setProcessingRequests(prev => ({ ...prev, [requestId]: true }));
    
    try {
      await respondToSquadRequest(requestId, accept);
      
      // Remove this request from the list
      setPendingRequests(requests => requests.filter(r => r.id !== requestId));
      
      toast.success(`Request ${accept ? 'accepted' : 'rejected'}`);
    } catch (error) {
      console.error(`Error ${accept ? 'accepting' : 'rejecting'} request:`, error);
      toast.error(`Failed to ${accept ? 'accept' : 'reject'} request`);
    } finally {
      setProcessingRequests(prev => ({ ...prev, [requestId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Squad Requests</h2>
        <p className="text-muted-foreground">Loading squad requests...</p>
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Squad Requests</h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No pending squad requests</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Squad Requests</h2>
      <div className="grid gap-4">
        {pendingRequests.map(request => (
          <Card key={request.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Squad Request</CardTitle>
              <CardDescription>
                {new Date(request.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {request.requesterName?.substring(0, 2).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{request.requesterName || "Unknown User"}</p>
                  {request.requesterUsername && (
                    <p className="text-sm text-muted-foreground">@{request.requesterUsername}</p>
                  )}
                </div>
              </div>
              <p className="mt-2">
                This user wants to add you to their squad.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRespond(request.id, false)}
                disabled={processingRequests[request.id]}
              >
                <XIcon className="h-4 w-4 mr-1" /> Reject
              </Button>
              <Button
                size="sm"
                onClick={() => handleRespond(request.id, true)}
                disabled={processingRequests[request.id]}
              >
                <CheckIcon className="h-4 w-4 mr-1" /> Accept
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SquadRequests;
