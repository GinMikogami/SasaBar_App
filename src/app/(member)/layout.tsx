"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { MemberNav } from "@/components/layout/MemberNav";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bar-black flex items-center justify-center">
        <div className="text-gold-500 text-2xl font-serif tracking-widest animate-pulse">
          SASABar
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bar-black pb-20">
      {children}
      <MemberNav />
    </div>
  );
}
