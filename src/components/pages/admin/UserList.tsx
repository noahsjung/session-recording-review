import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, UserCog } from "lucide-react";
import { supabase } from "@/supabase/supabase";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  supervisor_level: string | null;
  is_approved: boolean;
  created_at: string;
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Get users from auth.users and join with user_profiles
      const { data, error } = await supabase
        .from("user_profiles")
        .select(
          `
          id,
          full_name,
          role,
          supervisor_level,
          is_approved,
          created_at,
          users!inner(email)
        `,
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match our User interface
      const formattedUsers = data.map((item: any) => ({
        id: item.id,
        email: item.users.email,
        full_name: item.full_name,
        role: item.role,
        supervisor_level: item.supervisor_level,
        is_approved: item.is_approved,
        created_at: item.created_at,
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_approved: true })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_approved: true } : user,
        ),
      );

      toast({
        title: "Success",
        description: "Supervisor approved successfully",
      });
    } catch (error) {
      console.error("Error approving supervisor:", error);
      toast({
        title: "Error",
        description: "Failed to approve supervisor",
        variant: "destructive",
      });
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_approved: false })
        .eq("id", userId);

      if (error) throw error;

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_approved: false } : user,
        ),
      );

      toast({
        title: "Success",
        description: "Supervisor approval revoked",
      });
    } catch (error) {
      console.error("Error revoking approval:", error);
      toast({
        title: "Error",
        description: "Failed to revoke approval",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">User Management</h2>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          />
                          <AvatarFallback>
                            {user.full_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name}</div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "admin"
                            ? "default"
                            : user.role === "supervisor"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      {user.role === "supervisor" && user.supervisor_level && (
                        <div className="text-xs text-gray-500 mt-1">
                          Level:{" "}
                          {user.supervisor_level.charAt(0).toUpperCase() +
                            user.supervisor_level.slice(1)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>
                      {user.role === "supervisor" ? (
                        <Badge
                          variant={user.is_approved ? "success" : "destructive"}
                          className={
                            user.is_approved
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {user.is_approved ? "Approved" : "Pending Approval"}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-800"
                        >
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role === "supervisor" &&
                        (user.is_approved ? (
                          <Button
                            onClick={() => handleRevoke(user.id)}
                            variant="outline"
                            size="sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Revoke
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleApprove(user.id)}
                            variant="outline"
                            size="sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                        ))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
