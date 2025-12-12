"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout";
import { API_BASE_URL } from "@/config";

const adminProfileSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  restaurantName: z.string().min(2, {
    message: "Restaurant name must be at least 2 characters.",
  }),
  restaurantAddress: z.string().min(5, {
    message: "Restaurant address must be at least 5 characters.",
  }),
  noOfTables: z.number().min(1, {
    message: "Number of tables must be at least 1.",
  }),
});



const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, {
      message: "Old password is required.",
    }),
    newPassword: z.string().min(6, {
      message: "New password must be at least 6 characters.",
    }),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match.",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "New password must be different from old password.",
    path: ["newPassword"],
  });

export default function SettingsPage() {
  const [userId, setUserId] = useState<string>("");

  const adminProfileForm = useForm<z.infer<typeof adminProfileSchema>>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: {
      username: "",
      email: "",
      phoneNumber: "",
      restaurantName: "",
      restaurantAddress: "",
      noOfTables: 0,
    },
  });

  useEffect(() => {
    const fetchAdminProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "No token found in localStorage.",
          variant: "destructive",
        });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/user_profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `JWT ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin profile');
        }

        const data = await response.json();

        // Assuming the response has fields: username, email, phoneNumber, restaurantName, restaurantAddress, noOfTables
        adminProfileForm.setValue('username', data.username || '');
        adminProfileForm.setValue('email', data.email || '');
        adminProfileForm.setValue('phoneNumber', data.phoneNumber || '');
        adminProfileForm.setValue('restaurantName', data.restaurantName || '');
        adminProfileForm.setValue('restaurantAddress', data.restaurantAddress || '');
        adminProfileForm.setValue('noOfTables', data.noOfTables || 0);

        // Set user ID for update
        setUserId(data._id || '');

        
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch admin profile data.",
          variant: "destructive",
        });
      }
    };

    fetchAdminProfile();
  }, [adminProfileForm]);


  const changePasswordForm = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onAdminProfileSubmit(data: z.infer<typeof adminProfileSchema>) {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Error",
        description: "No token found in localStorage.",
        variant: "destructive",
      });
      return;
    }

    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('phoneNumber', data.phoneNumber);
    formData.append('restaurantName', data.restaurantName);
    formData.append('restaurantAddress', data.restaurantAddress);
    formData.append('noOfTables', data.noOfTables.toString());

    try {
      const response = await fetch(`${API_BASE_URL}/auth/update_user_profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`,
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to update admin profile');
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: "Admin profile updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update admin profile. Please try again.",
        variant: "destructive",
      });
    }
  }



  async function onChangePasswordSubmit(data: z.infer<typeof changePasswordSchema>) {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Error",
        description: "No token found in localStorage.",
        variant: "destructive",
      });
      return;
    }

    const formData = new URLSearchParams();
    formData.append('old_password', data.oldPassword);
    formData.append('new_password', data.newPassword);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change_password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `JWT ${token}`,
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to change password');
      }

      const result = await response.json();
      toast({
        title: "Success",
        description: "Password changed successfully.",
      });
      changePasswordForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <DashboardLayout activeItem="Settings">
      <div className="space-y-8 p-8">
        <Card>
          <CardHeader>
            <CardTitle>Admin Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...adminProfileForm}>
              <form
                onSubmit={adminProfileForm.handleSubmit(onAdminProfileSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={adminProfileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>adminname</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={adminProfileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={adminProfileForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="123-456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
               
             
        
                <Button type="submit">Save Changes</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

     

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...changePasswordForm}>
              <form
                onSubmit={changePasswordForm.handleSubmit(
                  onChangePasswordSubmit
                )}
                className="space-y-8"
              >
                <FormField
                  control={changePasswordForm.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Old Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={changePasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={changePasswordForm.control}
                  name="confirmNewPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Change Password</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}