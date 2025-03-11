
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { currentUser, setCurrentUser } = useUserStore();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formValues, setFormValues] = useState({
    name: "",
    username: "",
    bio: "",
  });
  
  // Fetch the latest profile data when the component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      
      try {
        if (currentUser?.id) {
          // Get the latest profile data from Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
          if (error) {
            console.error("Error fetching profile:", error);
            throw error;
          }
          
          if (data) {
            console.log("Profile fetched successfully:", data);
            
            // Update the form with the fetched data
            setFormValues({
              name: data.name || currentUser?.user_metadata?.name || "",
              username: data.username || "",
              bio: data.bio || "",
            });
            
            // Update the current user with the fetched data
            setCurrentUser({
              ...currentUser,
              username: data.username,
              bio: data.bio,
              name: data.name
            });
          }
        }
      } catch (error) {
        console.error("Error in fetchProfileData:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [currentUser?.id, setCurrentUser]);

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
    
    setIsSaving(true);
    
    try {
      // Log the values we're submitting
      console.log("Submitting profile update with:", formValues);
      
      // Update profile in Supabase
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: formValues.name,
          bio: formValues.bio || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser?.id);
        
      if (profileError) {
        console.error("Error updating profile in Supabase:", profileError);
        toast.error("Failed to update profile information");
        setIsSaving(false);
        return;
      }
      
      // Update user metadata in Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: { name: formValues.name }
      });
      
      if (authError) {
        console.error("Error updating auth user data:", authError);
        toast.error("Failed to update user data");
        setIsSaving(false);
        return;
      }
      
      // Update the local state
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          name: formValues.name,
          bio: formValues.bio || null,
          user_metadata: {
            ...currentUser.user_metadata,
            name: formValues.name
          }
        });
      }
      
      // Show success message
      toast.success("Profile updated successfully!");
      
      // Reset saving state and navigate after a delay
      setTimeout(() => {
        setIsSaving(false);
        navigate('/wishlist');
      }, 1500);
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2">Loading profile...</span>
        </div>
      </div>
    );
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
                <div className="space-y-4">
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
                      placeholder="Your username"
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      {formValues.username ? 
                        "Username is auto-generated and cannot be changed" : 
                        "A username will be automatically generated for you"}
                    </p>
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
                
                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate('/wishlist')}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-500 hover:bg-blue-600"
                    disabled={isSaving}
                  >
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
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
