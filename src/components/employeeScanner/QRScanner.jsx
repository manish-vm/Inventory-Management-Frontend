import { useEffect, useRef, useState } from 'react';
import { Camera, Square } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const QRScanner = ({ onDetected }) => {
  const scannerRef = useRef(null);
  const regionId = 'employee-product-qr-reader';
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  const start = async () => {
    setError('');
    try {
      const scanner = new Html5Qrcode(regionId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 100, height: 100 }, aspectRatio: 1.777 },
        (decodedText) => {
          onDetected(decodedText);
          stop();
        },
        () => {}
      );
      setRunning(true);
    } catch (err) {
      setError(err?.message || 'Camera permission denied or no camera found');
      setRunning(false);
    }
  };

  const stop = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop();
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live Camera QR Scanner</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Position QR code inside frame. Ensure proper lighting. QR will be detected automatically.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={start} disabled={running} className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-50">
            <Camera className="h-4 w-4" />
            Start Camera
          </button>
          <button type="button" onClick={stop} disabled={!running} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-600 dark:text-slate-200 disabled:opacity-50">
            <Square className="h-4 w-4" />
            Stop Camera
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-slate-950">
        <div id={regionId} className="min-h-[300px] w-full" />
        {!running && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-300">
            Camera preview inactive
          </div>
        )}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-blue-400 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]" />
      </div>
      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </section>
  );
};

export default QRScanner;
