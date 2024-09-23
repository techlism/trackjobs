'use client'
import { Button } from "./ui/button";

export default function SignOutButton(){
    const handleSignOut = async () => {
        try {
          const response = await fetch("/api/sign-out", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            window.location.href = "/";
          } else {
            const error = await response.json();
            console.error(error);
          }
        } catch (error) {
          console.error(error);
        }
      };    
    return  <Button onClick={handleSignOut}>
                Sign-out
            </Button>
}