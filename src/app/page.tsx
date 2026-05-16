'use client';

import { useUser } from "@/firebase";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (user) {
        redirect("/dashboard");
      } else {
        redirect("/auth");
      }
    }
  }, [user, loading]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}
