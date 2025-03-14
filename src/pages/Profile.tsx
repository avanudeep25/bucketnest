
import { useEffect } from "react";
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
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { currentUser, createUser } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || "",
      bio: currentUser?.bio || "",
    },
  });

  // Update form values when currentUser changes
  useEffect(() => {
    if (currentUser) {
      console.log("Current user in Profile:", currentUser);
      form.reset({
        name: currentUser.name || "",
        bio: currentUser.bio || "",
      });
    }
  }, [currentUser, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await createUser(data.name, data.bio);
      toast.success("Profile updated successfully");
      console.log("Profile updated successfully with:", data);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
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

              <Button type="submit">Update Profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
