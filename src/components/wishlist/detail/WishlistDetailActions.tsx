
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, CheckIcon, UndoIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WishlistDetailActionsProps {
  itemId: string;
  isCompleted?: boolean;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string, isComplete: boolean) => Promise<void>;
}

export const WishlistDetailActions = ({ 
  itemId, 
  isCompleted = false,
  onDelete, 
  onToggleComplete 
}: WishlistDetailActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => navigate(`/wishlist/edit/${itemId}`)}
        >
          <PencilIcon size={16} />
          <span>Edit</span>
        </Button>
        
        <Button
          variant={isCompleted ? "outline" : "default"}
          className={`flex items-center gap-1 ${!isCompleted ? "bg-green-600 hover:bg-green-700" : ""}`}
          onClick={() => onToggleComplete(itemId, !isCompleted)}
        >
          {isCompleted ? (
            <>
              <UndoIcon size={16} />
              <span>Mark Incomplete</span>
            </>
          ) : (
            <>
              <CheckIcon size={16} />
              <span>Mark Complete</span>
            </>
          )}
        </Button>
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="flex items-center gap-1 w-full">
            <TrashIcon size={16} />
            <span>Delete</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              experience and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(itemId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
