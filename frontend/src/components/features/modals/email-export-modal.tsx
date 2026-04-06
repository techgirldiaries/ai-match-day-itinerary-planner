import { X } from "lucide-preact";
import { useCallback } from "preact/hooks";
import { emailForExport, messages, showEmailExportModal } from "@/core/state";
import { t } from "@/i18n";
import { markDraftExported } from "@/storage/draft-storage";

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

export interface EmailExportModalProps {
  draftId?: string;
}

export function EmailExportModal({ draftId }: EmailExportModalProps) {
  const isOpen = showEmailExportModal.value;

  const handleClose = useCallback(() => {
    showEmailExportModal.value = false;
    emailForExport.value = "";
  }, []);

  const handleSubmit = useCallback(
    async (e: Event) => {
      e.preventDefault();

      const email = emailForExport.value.trim();
      if (!email) return;

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return;
      }

      // Build itinerary content from messages
      const itineraryContent = messages.value
        .map((msg) => {
          const timestamp = new Date(msg.createdAt).toLocaleString();
          const sender = msg.isAgent() ? "Agent" : "You";
          return `[${timestamp}] ${sender}: ${msg.text}`;
        })
        .join("\n\n");

      const emailPayload = {
        to: email,
        subject: t("emailExportSubject"),
        body: itineraryContent,
        draftId,
      };

      try {
        // TODO: Replace with actual backend API when available
        // For MVP, we'll just log and simulate success
        console.log("Email export payload:", emailPayload);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mark draft as exported if provided
        if (draftId) {
          markDraftExported(draftId);
        }

        // Show success message
        alert(t("emailSentSuccess") + " " + email + "!");
        handleClose();
      } catch (error) {
        console.error("Failed to export itinerary:", error);
        alert(t("emailSendFailed"));
      }
    },
    [draftId, handleClose],
  );

  if (!isOpen) return null;

  return (
    <div class={MODAL_OVERLAY_CLASS} onClick={handleClose}>
      <div class={MODAL_CONTENT_CLASS} onClick={(e) => e.stopPropagation()}>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-extrabold text-[#f5820d] dark:text-orange-200">
            {t("emailExportSubject")} â€“ Share your Hatters itinerary!
          </h2>
          <button
            onClick={handleClose}
            class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div class="mb-4">
            <label class="block text-sm font-bold text-[#1a1f3c] dark:text-orange-200 mb-2">
              Email Address (for your matchday plans)
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="your@email.com"
              class={INPUT_CLASS}
              value={emailForExport.value}
              onInput={(e) =>
                (emailForExport.value = (e.target as HTMLInputElement).value)
              }
              autoFocus
            />
            <p class="text-xs text-[#f5820d] dark:text-orange-300 mt-2 font-medium">
              Weâ€™ll send your itinerary to this email. No account needed. See
              you at Kenilworth Stadium Road! COYH 🟧⚪
            </p>
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              class={`${BUTTON_CLASS} ${SECONDARY_BUTTON_CLASS} flex-1`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!emailForExport.value.trim()}
              class={`${BUTTON_CLASS} ${PRIMARY_BUTTON_CLASS} flex-1 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {t("navSendEmail")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
