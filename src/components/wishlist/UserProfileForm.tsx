
import { useUserStore } from "@/store/userStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const UserProfileForm = () => {
  const createUser = useUserStore((state) => state.createUser);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Profile</CardTitle>
        <CardDescription>
          Set up your profile before adding Bucket List Goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;
            const bio = formData.get('bio') as string;
            
            if (name) {
              createUser(name, bio);
              toast.success("Profile created successfully!");
            }
          }} 
          className="space-y-4"
        >
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
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
              Create Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserProfileForm;
