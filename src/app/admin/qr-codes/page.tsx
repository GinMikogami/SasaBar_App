"use client";

import { useEffect, useState } from "react";
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
import { Plus, QrCode, Download, Copy, Check } from "lucide-react";

export default function QRCodesPage() {
  const { toast } = useToast();
  const [codes, setCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);

  // 生成ダイアログ
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  // 生成済みコード（ページ内メモリ）
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [qrImages, setQrImages] = useState<Record<string, string>>({});

  // QR表示モーダル
  const [viewOpen, setViewOpen] = useState(false);
  const [viewingQR, setViewingQR] = useState<QRCode | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<QRCodeInput>({ resolver: zodResolver(qrcodeSchema) });

  async function load() {
    setLoading(true);
    try { setCodes(await getAllQRCodes()); } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function generateQRImage(code: string): Promise<string> {
    const QRCodeLib = (await import("qrcode")).default;
    return QRCodeLib.toDataURL(code, {
      width: 256,
      margin: 2,
      color: { dark: "#0a0a0a", light: "#f0ead6" },
    });
  }

  async function openViewModal(qr: QRCode) {
    setViewingQR(qr);
    setViewingImage(null);
    setViewOpen(true);
    setViewLoading(true);
    try {
      // メモリにキャッシュ済みなら再利用
      const image = qrImages[qr.code] ?? await generateQRImage(qr.code);
      setQrImages((prev) => ({ ...prev, [qr.code]: image }));
      setViewingImage(image);
    } catch (e: unknown) {
      toast({ title: "QR生成エラー", description: e instanceof Error ? e.message : "失敗", variant: "destructive" });
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  }

  async function onSubmit(data: QRCodeInput) {
    setGenerating(true);
    try {
      const code = await createQRCode(data.point);
      const image = await generateQRImage(code);
      setGeneratedCodes((prev) => [code, ...prev]);
      setQrImages((prev) => ({ ...prev, [code]: image }));
      setDialogOpen(false);
      toast({ title: "QRコードを生成しました" });
      load();
    } catch (e: unknown) {
      toast({ title: "エラー", description: e instanceof Error ? e.message : "失敗", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  }

  async function copyToClipboard(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast({ title: "コピー失敗", description: "手動でコピーしてください", variant: "destructive" });
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
        <Button variant="gold" onClick={() => { reset({ point: undefined }); setDialogOpen(true); }}>
          <Plus className="w-4 h-4" /> QR生成
        </Button>
      </div>

      {/* 生成直後パネル */}
      {generatedCodes.length > 0 && (
        <Card className="mb-6 border-gold-500/30">
          <CardContent className="pt-5">
            <p className="text-gold-400 text-sm font-semibold mb-4">生成されたQRコード</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedCodes.map((code) => (
                <div key={code} className="flex gap-4 items-center bg-bar-surface rounded-lg p-3 border border-bar-border">
                  {qrImages[code] && (
                    <img src={qrImages[code]} alt={code} className="w-24 h-24 rounded flex-shrink-0" />
                  )}
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <p className="text-xs text-bar-muted">手動入力コード</p>
                    <p className="font-mono text-sm text-gray-100 break-all leading-relaxed">{code}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => copyToClipboard(code)}>
                        {copiedCode === code
                          ? <><Check className="w-3 h-3 text-green-400" /> コピー済</>
                          : <><Copy className="w-3 h-3" /> コピー</>}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => downloadQR(code, qrImages[code])}>
                        <Download className="w-3 h-3" /> DL
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 一覧テーブル */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center py-8 text-bar-muted text-sm animate-pulse">ロード中...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>手動入力コード</TableHead>
                  <TableHead>ポイント</TableHead>
                  <TableHead>使用人数</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {codes.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell>
                      <span className="font-mono text-sm text-gray-100 select-all">{qr.code}</span>
                    </TableCell>
                    <TableCell className="text-gold-400 font-semibold">{qr.point.toLocaleString()}pt</TableCell>
                    <TableCell>
                      {(qr.usedBy ?? []).length > 0 ? (
                        <Badge variant="success">{(qr.usedBy ?? []).length}人</Badge>
                      ) : (
                        <span className="text-bar-muted text-xs">未使用</span>
                      )}
                    </TableCell>
                    <TableCell className="text-bar-muted text-xs">{formatDate(qr.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openViewModal(qr)} title="QRを表示">
                          <QrCode className="w-3.5 h-3.5 text-bar-muted" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => copyToClipboard(qr.code)} title="コードをコピー">
                          {copiedCode === qr.code
                            ? <Check className="w-3.5 h-3.5 text-green-400" />
                            : <Copy className="w-3.5 h-3.5 text-bar-muted" />}
                        </Button>
                      </div>
                    </TableCell>
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

      {/* QR生成ダイアログ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QRコード生成</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-gray-300 text-xs">ポイント数</Label>
              <Input type="number" {...register("point")} placeholder="1000" min="1" />
              {errors.point && <p className="text-red-400 text-xs">{errors.point.message}</p>}
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

      {/* QR表示モーダル */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>QRコード</DialogTitle>
          </DialogHeader>
          {viewingQR && (
            <div className="flex flex-col items-center gap-4 py-2">
              {viewLoading ? (
                <div className="w-48 h-48 flex items-center justify-center">
                  <p className="text-bar-muted text-sm animate-pulse">生成中...</p>
                </div>
              ) : viewingImage ? (
                <img src={viewingImage} alt={viewingQR.code} className="w-48 h-48 rounded" />
              ) : null}
              <div className="w-full space-y-1">
                <p className="text-xs text-bar-muted">手動入力コード</p>
                <p className="font-mono text-sm text-gray-100 break-all">{viewingQR.code}</p>
                <p className="text-gold-400 text-sm font-semibold">{viewingQR.point.toLocaleString()}pt</p>
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1" onClick={() => copyToClipboard(viewingQR.code)}>
                  {copiedCode === viewingQR.code
                    ? <><Check className="w-4 h-4 text-green-400" /> コピー済</>
                    : <><Copy className="w-4 h-4" /> コピー</>}
                </Button>
                {viewingImage && (
                  <Button variant="outline" className="flex-1" onClick={() => downloadQR(viewingQR.code, viewingImage)}>
                    <Download className="w-4 h-4" /> DL
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
