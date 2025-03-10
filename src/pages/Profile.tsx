
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/layout/Navigation";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { currentUser, setCurrentUser } = useUserStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    name: currentUser?.user_metadata?.name || "",
    username: currentUser?.username || "",
    bio: currentUser?.bio || "",
  });

  useEffect(() => {
    if (currentUser) {
      setFormValues({
        name: currentUser?.user_metadata?.name || "",
        username: currentUser?.username || "",
        bio: currentUser?.bio || "",
      });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formValues.name.trim()) {
      toast.error("Name is required");
      return;
    }
    
    if (!formValues.username.trim()) {
      toast.error("Username is required");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Update user metadata in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          name: formValues.name,
        }
      });
      
      if (updateError) throw updateError;
      
      // Check if profile exists in database
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser?.id)
        .single();
      
      // If profile exists, update it, otherwise create a new one
      if (existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: formValues.name,
            username: formValues.username,
            bio: formValues.bio || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentUser?.id);
          
        if (profileError) throw profileError;
      } else {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: currentUser?.id,
            name: formValues.name,
            username: formValues.username,
            bio: formValues.bio || null,
          });
          
        if (profileError) throw profileError;
      }
      
      // Update local user state
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          user_metadata: {
            ...currentUser.user_metadata,
            name: formValues.name,
          },
          username: formValues.username,
          bio: formValues.bio,
        };
        setCurrentUser(updatedUser);
      }
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container px-4 py-8 md:px-6 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your profile information visible to other users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={currentUser?.user_metadata?.avatar_url} />
                      <AvatarFallback className="text-xl">
                        {formValues.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground">Profile Image</p>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={currentUser?.email || ""}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your email cannot be changed
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input 
                        id="name" 
                        name="name"
                        value={formValues.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        name="username"
                        value={formValues.username}
                        onChange={handleChange}
                        placeholder="Choose a unique username"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        name="bio"
                        value={formValues.bio}
                        onChange={handleChange}
                        placeholder="Tell others about yourself"
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/wishlist')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-500 hover:bg-blue-600"
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
