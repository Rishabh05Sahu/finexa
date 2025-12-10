"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfilePage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const logout = useAuthStore((s) => s.logout);

  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [edit, setEdit] = useState({
    name: "",
    email: "",
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
  });

  // Fetch profile
  useEffect(() => {
    if (!accessToken) return;

    const fetchProfile = async () => {
      const res = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status === 401) {
        logout();
        router.push("/login");
        return;
      }

      const data = await res.json();
      setProfile(data);
      setEdit({ name: data.name, email: data.email });
      setLoading(false);
    };

    fetchProfile();
  }, [accessToken]);

  const updateProfile = async () => {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(edit),
    });

    const data = await res.json();

    if (!res.ok) return toast.error(data.error);
    toast.success("Profile updated");
    setProfile(data);
  };

  const changePassword = async () => {
    const res = await fetch("/api/profile/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(passwords),
    });

    const data = await res.json();

    if (!res.ok) return toast.error(data.error);

    toast.success("Password updated");
    setPasswords({ oldPassword: "", newPassword: "" });
  };

  if (loading) return <p className="p-4 text-gray-500">Loading profile…</p>;

  // First initial avatar
  const initial = profile?.name?.[0]?.toUpperCase() || "U";

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>

      {/* Avatar + Basic Info */}
      {/* Avatar + Upload */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="relative w-20 h-20">
            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                className="w-20 h-20 rounded-full object-cover border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
                {initial}
              </div>
            )}

            {/* Upload Button */}
            <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full border cursor-pointer shadow">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const form = new FormData();
                  form.append("file", file);

                  const res = await fetch("/api/profile/upload", {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                    },
                    body: form,
                  });

                  const data = await res.json();
                  if (data.url) {
                    setProfile((prev: any) => ({
                      ...prev,
                      profileImage: data.url,
                    }));
                    toast.success("Profile picture updated");
                  }
                }}
              />
              <span className="text-xs">📷</span>
            </label>
          </div>

          <div>
            <p className="text-xl font-semibold">{profile.name}</p>
            <p className="text-gray-600">{profile.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Update Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Full Name"
            value={edit.name}
            onChange={(e) => setEdit({ ...edit, name: e.target.value })}
          />
          <Input
            placeholder="Email"
            type="email"
            value={edit.email}
            onChange={(e) => setEdit({ ...edit, email: e.target.value })}
          />
          <Button onClick={updateProfile} className="w-full">
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Current Password"
            type="password"
            value={passwords.oldPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, oldPassword: e.target.value })
            }
          />
          <Input
            placeholder="New Password"
            type="password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
          />

          <Button onClick={changePassword} className="w-full">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="destructive"
        className="w-full"
        onClick={() => {
          logout();
          router.push("/login");
        }}
      >
        Logout
      </Button>
    </div>
  );
}
