import { X, Copy, Check } from "lucide-react";
import { useCallback, useState } from "preact/hooks";
import { showShareModal, shareUrl } from "@/core/signals";
import type { ItineraryResponse } from "@/core/types";
import { t } from "@/i18n";

const MODAL_OVERLAY_CLASS =
  "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
const MODAL_CONTENT_CLASS =
  "bg-white dark:bg-[#1a1f3c] rounded-lg shadow-xl max-w-md w-full mx-4 p-6 border-2 border-[#f5820d]";
const INPUT_CLASS =
  "w-full bg-white dark:bg-[#1a1f3c] border border-[#f5820d] " +
  "dark:border-orange-400 px-4 py-2 rounded-lg text-[#1a1f3c] dark:text-orange-100 " +
  "dark:placeholder-orange-200 placeholder-[#f5820d] transition-colors focus:outline-none " +
  "focus:ring-2 focus:ring-[#f5820d] font-semibold";
const BUTTON_CLASS =
  "px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#F5820D]";
const PRIMARY_BUTTON_CLASS =
  "bg-[#f5820d] text-white hover:bg-orange-500 active:bg-orange-600 font-bold shadow-md";
const SECONDARY_BUTTON_CLASS =
  "bg-zinc-300 dark:bg-zinc-700 text-zinc-800 dark:text-white hover:bg-zinc-400 dark:hover:bg-zinc-600";

export interface ShareModalProps {
  itinerary: ItineraryResponse;
}

export function ShareModal({ itinerary }: ShareModalProps) {
  const isOpen = showShareModal.value;
  const currentShareUrl = shareUrl.value;
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string>("");

  const handleClose = useCallback(() => {
    showShareModal.value = false;
    shareUrl.value = "";
    setError("");
  }, []);

  const generateShareLink = useCallback(async () => {
    if (!itinerary) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/shares", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itinerary,
          group_size: 4,
          expires_in_hours: 48,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      const data = await response.json();
      if (data.success && data.share?.share_url) {
        shareUrl.value = data.share.share_url;
      } else {
        throw new Error(data.message || "Failed to create share link");
      }
    } catch (err) {
      console.error("Share error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create share link",
      );
    } finally {
      setLoading(false);
    }
  }, [itinerary]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!currentShareUrl) return;

    try {
      await navigator.clipboard.writeText(currentShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy link");
    }
  }, [currentShareUrl]);

  if (!isOpen) return null;

  return (
    <div class={MODAL_OVERLAY_CLASS} onClick={handleClose}>
      <div class={MODAL_CONTENT_CLASS} onClick={(e) => e.stopPropagation()}>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-extrabold text-[#f5820d] dark:text-orange-200">
            Share your Hatters itinerary! 🟠
          </h2>
          <button
            onClick={handleClose}
            class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div class="space-y-4">
          {!currentShareUrl ? (
            <>
              <p class="text-sm text-[#1a1f3c] dark:text-orange-100 font-medium">
                Generate a short link to share your matchday plans with your
                group. No email needed!
              </p>
              {error && (
                <div class="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-3 py-2 rounded text-sm font-medium">
                  {error}
                </div>
              )}
              <button
                onClick={generateShareLink}
                disabled={loading}
                class={`${BUTTON_CLASS} ${PRIMARY_BUTTON_CLASS} w-full disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? "Generating..." : "Generate Share Link"}
              </button>
            </>
          ) : (
            <>
              <p class="text-sm text-[#1a1f3c] dark:text-orange-100 font-medium">
                Share this link with your group via WhatsApp, email, or text:
              </p>
              <div class="flex gap-2">
                <label for="share-url-input" class="sr-only">
                  Share link
                </label>
                <input
                  id="share-url-input"
                  type="text"
                  readOnly
                  value={currentShareUrl}
                  class={INPUT_CLASS}
                  title="Share link"
                />
                <button
                  onClick={handleCopyToClipboard}
                  class={`${BUTTON_CLASS} ${PRIMARY_BUTTON_CLASS} flex items-center gap-2 whitespace-nowrap`}
                >
                  {copied ? (
                    <>
                      <Check size={16} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} /> Copy
                    </>
                  )}
                </button>
              </div>
              <p class="text-xs text-[#f5820d] dark:text-orange-300 font-medium">
                Link expires in 48 hours. Recipients can view and save as their
                own draft!
              </p>
              <button
                onClick={() => {
                  shareUrl.value = "";
                }}
                class={`${BUTTON_CLASS} ${SECONDARY_BUTTON_CLASS} w-full`}
              >
                Generate New Link
              </button>
            </>
          )}

          <button
            onClick={handleClose}
            class={`${BUTTON_CLASS} ${SECONDARY_BUTTON_CLASS} w-full`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
