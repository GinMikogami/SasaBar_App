"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { redeemQRCode } from "@/lib/firebase/firestore";
import { useToast } from "@/hooks/useToast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, CheckCircle2, AlertCircle } from "lucide-react";

export default function QRScanPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; points?: number } | null>(null);
  const scannerRef = useRef<{ stop: () => void } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop();
    };
  }, []);

  async function startScanner() {
    if (typeof window === "undefined") return;
    setScanning(true);
    setResult(null);

    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner as unknown as { stop: () => void };

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await scanner.stop();
          setScanning(false);
          await redeemCode(decodedText);
        },
        () => {}
      );
    } catch {
      setScanning(false);
      toast({
        title: "カメラエラー",
        description: "手動入力をご利用ください",
        variant: "destructive",
      });
    }
  }

  async function redeemCode(code: string) {
    if (!user || !code.trim()) return;
    setProcessing(true);
    setResult(null);
    try {
      const points = await redeemQRCode(code.trim(), user.id);
      await refreshUser();
      setResult({ success: true, points });
      toast({
        title: "ポイント獲得！",
        description: `${points.toLocaleString()}pt獲得しました`,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "エラーが発生しました";
      setResult({ success: false });
      toast({ title: "エラー", description: msg, variant: "destructive" });
    } finally {
      setProcessing(false);
      setManualCode("");
    }
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 pt-8">
      <div className="mb-6">
        <h1 className="text-xl font-serif text-gray-100 tracking-widest">QRスキャン</h1>
        <div className="mt-1 w-10 h-px gold-gradient" />
      </div>

      {/* Scanner */}
      <Card className="mb-4">
        <CardContent className="pt-5">
          <div
            id="qr-reader"
            ref={containerRef}
            className={scanning ? "rounded-lg overflow-hidden" : "hidden"}
          />
          {!scanning && (
            <div className="flex flex-col items-center py-8">
              <div className="w-24 h-24 border-2 border-dashed border-gold-500/30 rounded-2xl flex items-center justify-center mb-4">
                <QrCode className="w-12 h-12 text-gold-500/50" />
              </div>
              <Button variant="gold" onClick={startScanner}>
                <QrCode className="w-4 h-4" />
                QRコードをスキャン
              </Button>
            </div>
          )}
          {scanning && (
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={() => {
                scannerRef.current?.stop();
                setScanning(false);
              }}
            >
              キャンセル
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className="mb-4">
          <CardContent className="pt-5 pb-4">
            <div className="flex flex-col items-center gap-3">
              {result.success ? (
                <>
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                  <p className="text-gray-100 font-semibold">ポイント獲得成功！</p>
                  <p className="text-3xl font-bold gold-text-gradient">
                    +{result.points?.toLocaleString()}pt
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="w-12 h-12 text-red-400" />
                  <p className="text-gray-300">認識できませんでした</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Input */}
      <Card>
        <CardContent className="pt-5">
          <p className="text-bar-muted text-xs tracking-wider mb-3">コードを手動入力</p>
          <div className="flex gap-2">
            <Input
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="SASABAR-500"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => redeemCode(manualCode)}
              disabled={processing || !manualCode.trim()}
            >
              {processing ? "処理中" : "適用"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
