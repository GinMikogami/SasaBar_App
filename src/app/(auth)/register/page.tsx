"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/lib/firebase/auth";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setLoading(true);
    try {
      await registerUser(data.name, data.email, data.phone, data.password);
      toast({ title: "登録完了", description: "SASABarへようこそ！" });
      router.push("/dashboard");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "登録に失敗しました";
      toast({ title: "エラー", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="text-center text-gold-500 tracking-widest">
          会員登録
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { id: "name", label: "お名前", type: "text", placeholder: "山田 太郎", key: "name" as const },
            { id: "email", label: "メールアドレス", type: "email", placeholder: "example@email.com", key: "email" as const },
            { id: "phone", label: "電話番号", type: "tel", placeholder: "090-1234-5678", key: "phone" as const },
          ].map(({ id, label, type, placeholder, key }) => (
            <div key={id} className="space-y-2">
              <Label htmlFor={id} className="text-gray-300 text-xs tracking-wider">
                {label}
              </Label>
              <Input
                id={id}
                type={type}
                placeholder={placeholder}
                {...register(key)}
              />
              {errors[key] && (
                <p className="text-red-400 text-xs">{errors[key]?.message}</p>
              )}
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300 text-xs tracking-wider">
              パスワード
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="8文字以上"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-300 text-xs tracking-wider">
              パスワード確認
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="パスワードを再入力"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            variant="gold"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? "登録中..." : "会員登録"}
          </Button>
        </form>
        <p className="text-center mt-6 text-gray-500 text-sm">
          既にアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-gold-400 hover:text-gold-300">
            ログイン
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
