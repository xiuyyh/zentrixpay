'use client';

import { useUser } from "@/firebase";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (user) {
        redirect("/admin/dashboard");
      } else {
        redirect("/admin/auth");
      }
    }
  }, [user, loading]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-950">
      <Loader2 className="size-8 animate-spin text-red-500" />
    </div>
  );
}
