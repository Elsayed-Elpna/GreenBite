import React, { useMemo, useRef, useState } from "react";
import { AlertTriangle, Camera, Info, CheckCircle2, Loader2, ShieldAlert, ShieldCheck, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { useFoodSafetyScanFlow } from "@/hooks/food";

const features = [{ label: "95% Accuracy" }, { label: "Instant Results" }, { label: "Smart Suggestions" }];

const verdictMeta = (verdict) => {
  switch (verdict) {
    case "likely_spoiled":
      return {
        label: "Likely spoiled",
        icon: ShieldAlert,
        className: "bg-rose-100 text-rose-800 border border-rose-200",
      };
    case "likely_safe":
      return {
        label: "Likely safe",
        icon: ShieldCheck,
        className: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      };
    default:
      return {
        label: verdict || "Unknown",
        icon: AlertTriangle,
        className: "bg-amber-100 text-amber-800 border border-amber-200",
      };
  }
};

const SpoilageDetection = () => {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const [showHow, setShowHow] = useState(false);
  const [hideResult, setHideResult] = useState(false);

  const flow = useFoodSafetyScanFlow();
  const job = flow.data; // scan-status payload
  const isCreating = flow.create.isPending;
  const isPolling = flow.isFetching; // query fetching
  const isBusy = isCreating || isPolling;

  const result = job?.result || null;
  const verdict = result?.verdict || null;

  const meta = useMemo(() => verdictMeta(verdict), [verdict]);
  const VerdictIcon = meta.icon;

  const onPickFile = () => {
    // on mobile: open camera by default
    if (isMobile) return cameraRef.current?.click();
    // on desktop: open gallery picker (camera capture is still available via secondary button if you add one)
    return galleryRef.current?.click();
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation (optional)
    if (!file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) return; // 8MB

    setHideResult(false); // show new results for new scan
    flow.start(file);
    // allow selecting the same file again
    e.target.value = "";
  };

  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  return (
    <section className="py-4">
      <div className="
        rounded-2xl p-6 md:p-8 lg:p-10
        flex flex-col lg:flex-row gap-6 items-center
        bg-gradient-to-r from-emerald-50/60 via-green-50/50 to-orange-50/50
        border border-emerald-100/70
        shadow-sm
      ">
        {/* hidden inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onFileChange}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Spoilage Detection</h2>
              <p className="text-sm text-muted-foreground font-medium">AI-powered freshness analysis</p>
            </div>
          </div>

          <p className="text-muted-foreground mt-4 mb-6 max-w-lg">
            Upload a photo and we’ll analyze visible spoilage signs, estimate safety risk, and suggest next steps.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              variant="primary"
              className="gap-2 bg-emerald-700 hover:bg-emerald-800"
              onClick={onPickFile}
              disabled={isBusy}

            >
              <p className="flex items-center gap-2">
                {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                {isCreating ? "Uploading…" : isPolling ? "Analyzing…" : isMobile ? "Take Photo" : "Upload"}
              </p>
            </Button>

            {/*  always allow camera even on desktop */}
            <Button
              variant="outline"
              className="gap-2 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
              onClick={() => cameraRef.current?.click()}
              type="button"
              disabled={isBusy}
            >
              <p className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Camera
              </p>
            </Button>

            <Button
              variant="outline"
              className="gap-2 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
              onClick={() => setShowHow((v) => !v)}
              type="button"
            >
              <p className="flex items-center gap-2">
                <Info className="w-4 h-4" />
                {showHow ? "Hide" : "How it Works"}
              </p>
            </Button>
          </div>

          {showHow && (
            <div className="rounded-xl border border-emerald-100 bg-white/70 p-4 text-sm text-muted-foreground mb-6">
              <ol className="list-decimal ml-5 space-y-1">
                <li>Choose a clear photo of the food item.</li>
                <li>We create a background scan job (Celery).</li>
                <li>We poll scan status until results are ready.</li>
              </ol>
              <p className="mt-2 text-xs">
                Tip: Use good lighting and keep the food centered for best results.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Status + Result */}
          <div className="mt-6">
            {flow.create.isError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm">
                Upload failed. Please try again.
              </div>
            )}

            {flow.isError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm">
                Scan status failed. Please try again.
              </div>
            )}

            {job?.status && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-xs text-muted-foreground">Status:</span>
                <span className="rounded-full px-3 py-1 text-xs font-semibold border bg-white/70">
                  {job.status}
                </span>
                {flow.jobId ? (
                  <span className="text-xs text-muted-foreground">Job #{flow.jobId}</span>
                ) : null}
              </div>
            )}

            {result && !hideResult && (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-white/80 p-5 relative">
                {/* close button */}
                <button
                  type="button"
                  onClick={() => setHideResult(true)}
                  className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full
                           bg-white/90 border border-emerald-100 text-emerald-900 hover:bg-emerald-50 transition"
                  aria-label="Close result"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
                      <VerdictIcon className="w-4 h-4" />
                      {meta.label}
                    </div>
                    <p className="mt-3 text-sm text-foreground font-semibold">Confidence: {Math.round((result.confidence || 0) * 100)}%</p>
                    {result.warning ? (
                      <p className="mt-2 text-sm text-muted-foreground">{result.warning}</p>
                    ) : null}
                  </div>
                </div>

                {Array.isArray(result.visible_signs) && result.visible_signs.length > 0 && (
                  <>
                    <h3 className="mt-4 text-sm font-semibold text-foreground">Visible signs</h3>
                    <ul className="mt-2 list-disc ml-5 text-sm text-muted-foreground space-y-1">
                      {result.visible_signs.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </>
                )}

                {Array.isArray(result.safe_next_steps) && result.safe_next_steps.length > 0 && (
                  <>
                    <h3 className="mt-4 text-sm font-semibold text-foreground">Safe next steps</h3>
                    <ul className="mt-2 list-disc ml-5 text-sm text-muted-foreground space-y-1">
                      {result.safe_next_steps.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </>
                )}

                {result.reasoning_summary ? (
                  <>
                    <h3 className="mt-4 text-sm font-semibold text-foreground">Summary</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{result.reasoning_summary}</p>
                  </>
                ) : null}
              </div>
            )}

            {/* show a small "dismissed" chip so user can bring it back */}
            {result && hideResult && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setHideResult(false)}
                  className="text-sm font-medium text-emerald-800 hover:text-emerald-900 underline underline-offset-4"
                >
                  Show last result
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right visual */}
        <div className="flex-shrink-0 w-full lg:w-auto">
          <div className="relative w-full max-w-xs mx-auto lg:mx-0">
            <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-emerald-100">
              <div className="p-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-orange-50">
                <p className="text-sm font-semibold text-foreground">Tip</p>
                <p className="text-xs text-muted-foreground mt-1">Snap a close, well-lit photo for best accuracy.</p>
              </div>
              <div className="aspect-[4/3] bg-gray-50">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&h=500&fit=crop"
                  alt="Fresh produce scanning"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="pointer-events-none absolute -inset-1 rounded-2xl ring-1 ring-emerald-100" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpoilageDetection;
