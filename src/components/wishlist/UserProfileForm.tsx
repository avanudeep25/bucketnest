
import { useUserStore } from "@/store/userStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const UserProfileForm = () => {
  const { currentUser, setCurrentUser, createUser } = useUserStore((state) => ({
    currentUser: state.currentUser,
    setCurrentUser: state.setCurrentUser,
    createUser: state.createUser
  }));
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      const bio = formData.get('bio') as string;
      
      if (!name) {
        toast.error("Name is required");
        setIsSubmitting(false);
        return;
      }
      
      await createUser(name, bio);
      toast.success("Profile created successfully!");
      
      // Ensure the current user state is updated
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser({
          ...session.user,
          name,
          bio
        });
      }
      
      // Give the toast time to show
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Failed to create profile. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Profile</CardTitle>
        <CardDescription>
          Set up your profile before adding Bucket List Goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Your Name</label>
            <Input id="name" name="name" placeholder="Enter your name" required />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="bio" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">About You (Optional)</label>
            <Textarea 
              id="bio" 
              name="bio" 
              placeholder="Tell us a bit about yourself"
              className="min-h-[100px]"
            />
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                "Create Profile"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
