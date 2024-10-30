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
    <div className="flex items-center justify-center bg-background min-h-[95dvh] m-auto">
      <Card className="min-w-72 md:min-w-96 lg:min-w-[424px] xl:min-w-[450px]">
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