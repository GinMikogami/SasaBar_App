"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "@/lib/firebase/auth";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setLoading(true);
    try {
      await loginUser(data.email, data.password);
      router.push("/dashboard");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "ログインに失敗しました";
      toast({ title: "エラー", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-center text-gold-500 tracking-widest">
          ログイン
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300 text-xs tracking-wider">
              メールアドレス
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              {...register("email")}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="text-red-400 text-xs">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300 text-xs tracking-wider">
              パスワード
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              placeholder="・・・・・・・・"
            />
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>
          <Button
            type="submit"
            variant="gold"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>
        <p className="text-center mt-6 text-gray-500 text-sm">
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="text-gold-400 hover:text-gold-300">
            会員登録
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
