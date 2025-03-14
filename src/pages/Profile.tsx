
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { currentUser, createUser } = useUserStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else {
      // Check if this is a new user (no name set yet)
      setIsNewUser(!currentUser.name || currentUser.name.trim() === '');
    }
  }, [currentUser, navigate]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
    },
  });

  // Fetch latest user data directly from Supabase
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        if (!currentUser) return;
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("Current user data from Supabase:", user);
          
          // Make sure we're setting form values with data that exists
          form.reset({
            name: user.user_metadata?.name || "",
            bio: user.user_metadata?.bio || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchCurrentUser();
  }, [currentUser, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setLoading(true);
      // Update user metadata directly with Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          bio: data.bio,
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Also update local state through the store
      await createUser(data.name, data.bio);
      
      toast({
        title: "Profile updated successfully",
        description: "Your changes have been saved",
      });
      
      console.log("Profile updated successfully with:", data);
      
      // If this was a new user filling out their profile for the first time,
      // redirect them to the create page
      if (isNewUser) {
        console.log("New user completed profile setup, redirecting to create page");
        setTimeout(() => {
          navigate("/create", { replace: true });
        }, 1000); // Small delay to ensure UI updates and toast appears
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Failed to update profile",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  // Get initials for avatar fallback
  const getInitials = () => {
    if (currentUser.name) {
      return currentUser.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return currentUser.email?.substring(0, 2).toUpperCase() || "?";
  };

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={currentUser.avatar_url || ""} alt={currentUser.name || "User"} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>Profile Settings</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {isNewUser 
                ? "Complete your profile to get started" 
                : "Update your personal information"}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <Input value={currentUser.email} disabled />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell us a bit about yourself"
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : isNewUser ? "Complete Profile" : "Update Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
