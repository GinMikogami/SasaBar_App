"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAllQRCodes, createQRCode } from "@/lib/firebase/firestore";
import { qrcodeSchema, type QRCodeInput } from "@/lib/validations/qrcode";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { QRCode } from "@/types";
import { Plus, QrCode, Download } from "lucide-react";

export default function QRCodesPage() {
  const { toast } = useToast();
  const [codes, setCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<QRCodeInput>({ resolver: zodResolver(qrcodeSchema) });

  async function load() {
    setLoading(true);
    try { setCodes(await getAllQRCodes()); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function generateQRImage(code: string): Promise<string> {
    const QRCode = (await import("qrcode")).default;
    return QRCode.toDataURL(code, {
      width: 200,
      margin: 2,
      color: { dark: "#0a0a0a", light: "#f0ead6" },
    });
  }

  async function onSubmit(data: QRCodeInput) {
    setGenerating(true);
    const created: string[] = [];
    try {
      for (let i = 0; i < data.count; i++) {
        const code = await createQRCode(data.point, new Date(data.expiresAt));
        created.push(code);
      }
      const images: Record<string, string> = {};
      for (const code of created) {
        images[code] = await generateQRImage(code);
      }
      setGeneratedCodes(created);
      setQrImages(images);
      toast({ title: `${data.count}件のQRコードを生成しました` });
      load();
    } catch (e: unknown) {
      toast({ title: "エラー", description: e instanceof Error ? e.message : "失敗", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  function downloadQR(code: string, dataUrl: string) {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${code}.png`;
    a.click();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-serif text-gray-100 tracking-widest">QRコード管理</h1>
          <div className="mt-1 w-12 h-px gold-gradient" />
        </div>
        <Button variant="gold" onClick={() => { setGeneratedCodes([]); setDialogOpen(true); reset(); }}>
          <Plus className="w-4 h-4" /> QR生成
        </Button>
      </div>

      {/* Generated QRs */}
      {generatedCodes.length > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-5">
            <p className="text-gold-400 text-sm font-semibold mb-4">生成されたQRコード</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {generatedCodes.map((code) => (
                <div key={code} className="flex flex-col items-center gap-2">
                  {qrImages[code] && (
                    <img src={qrImages[code]} alt={code} className="w-32 h-32 rounded" />
                  )}
                  <p className="text-xs text-bar-muted text-center break-all">{code}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQR(code, qrImages[code])}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center py-8 text-bar-muted text-sm animate-pulse">ロード中...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QRコード</TableHead>
                  <TableHead>ポイント</TableHead>
                  <TableHead>有効期限</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>作成日</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell className="font-mono text-xs text-gray-300">{qr.code}</TableCell>
                    <TableCell className="text-gold-400 font-semibold">{qr.point.toLocaleString()}pt</TableCell>
                    <TableCell className="text-bar-muted text-xs">{formatDate(qr.expiresAt)}</TableCell>
                    <TableCell>
                      <Badge variant={qr.isUsed ? "secondary" : "success"}>
                        {qr.isUsed ? "使用済" : "未使用"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-bar-muted text-xs">{formatDate(qr.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!loading && codes.length === 0 && (
            <div className="text-center py-16">
              <QrCode className="w-12 h-12 text-bar-border mx-auto mb-3" />
              <p className="text-bar-muted text-sm">QRコードがありません</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QRコード生成</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">ポイント数</Label>
              <Input type="number" {...register("point")} placeholder="500" min="1" />
              {errors.point && <p className="text-red-400 text-xs">{errors.point.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">有効期限</Label>
              <Input type="datetime-local" {...register("expiresAt")} />
              {errors.expiresAt && <p className="text-red-400 text-xs">{errors.expiresAt.message}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">発行枚数</Label>
              <Input type="number" {...register("count")} placeholder="1" min="1" max="100" />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>キャンセル</Button>
              <Button type="submit" variant="gold" disabled={generating}>
                <QrCode className="w-4 h-4" />
                {generating ? "生成中..." : "QR生成"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
