"use client";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import SignOutButton from '@/components/SignOut';

type ProfileProps = {
  user: {
    email: string;
  };
};

export function Profile({ user }: ProfileProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[78dvh] bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Profile</CardTitle>
          <CardDescription className="text-center">Your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Email</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <SignOutButton />
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}