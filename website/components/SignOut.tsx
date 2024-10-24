'use client'
import { useState } from "react";
import { Button } from "./ui/button";
import Loader from "./Loader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SignOutButton() {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSignOut = async () => {
    setProcessing(true);
    setError("");
    
    try {
      const response = await fetch("/api/sign-out", {
        method: "GET",
        credentials: 'include'
      });
      
      if (response.ok) {
        window.location.href = "/";
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to sign out. Please try again in a few moments.");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again in a few moments.");
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Button 
        variant="destructive" 
        onClick={handleSignOut}
        disabled={processing}
      >
        {processing ? <Loader /> : "Sign Out"}
      </Button>

      {error && (
        <AlertDialog open={!!error} onOpenChange={() => setError("")}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unable to Sign Out</AlertDialogTitle>
              <AlertDialogDescription>{error}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setError("")} className="hover:bg-transparent bg-transparent">
                Understood
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}