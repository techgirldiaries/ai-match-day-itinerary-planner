import { AlertTriangle, Home } from "lucide-preact";
import { useEffect, useState } from "preact/hooks";
import { ItineraryRenderer } from "@/components/features/itinerary";
import { currentPage, savedDrafts } from "@/core/state";
import type { ChatMessage, ItineraryResponse } from "@/core/types";
import { t } from "@/i18n";
import { saveDraft } from "@/storage/draft-storage";

interface SharedItineraryPageProps {
  shareId: string;
}

type LoadingState = "loading" | "success" | "expired" | "not_found" | "error";

export function SharedItineraryPage({ shareId }: SharedItineraryPageProps) {
  const [state, setState] = useState<LoadingState>("loading");
  const [itinerary, setItinerary] = useState<ItineraryResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSharedItinerary() {
      try {
        const response = await fetch(`/api/shares/${shareId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setState("not_found");
            return;
          }
          if (response.status === 410) {
            setState("expired");
            return;
          }
          throw new Error("Failed to fetch shared itinerary");
        }

        const data = await response.json();

        if (!data.success) {
          if (data.error === "share_expired") {
            setState("expired");
          } else if (data.error === "share_not_found") {
            setState("not_found");
          } else {
            setState("error");
            setError(data.message || "Something went wrong");
          }
          return;
        }

        if (data.share && data.share.itinerary_data) {
          // Parse itinerary data if it's a string
          let itineraryData = data.share.itinerary_data;
          if (typeof itineraryData === "string") {
            itineraryData = JSON.parse(itineraryData);
          }
          setItinerary(itineraryData);
          setState("success");
        } else {
          setState("error");
          setError("Invalid itinerary data");
        }
      } catch (err) {
        console.error("Failed to fetch shared itinerary:", err);
        setState("error");
        setError(
          err instanceof Error ? err.message : "Failed to load itinerary",
        );
      }
    }

    fetchSharedItinerary();
  }, [shareId]);

  const handleSaveAsDraft = async () => {
    if (!itinerary) return;

    setSaving(true);
    try {
      // Create a message-like structure from the itinerary
      const draftMessages: ChatMessage[] = [
        {
          id: crypto.randomUUID(),
          type: "agent-message",
          text: JSON.stringify(itinerary),
          createdAt: new Date(),
          isAgent: () => true,
        },
      ];

      const draft = saveDraft(draftMessages);
      savedDrafts.value = [...savedDrafts.value, draft];

      // Show success and redirect
      alert("Itinerary saved as draft! ✅");
      currentPage.value = "drafts";
    } catch (err) {
      console.error("Failed to save draft:", err);
      alert("Failed to save draft. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleGoHome = () => {
    currentPage.value = "chat";
  };

  // Loading state
  if (state === "loading") {
    return (
      <div class="flex-1 flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5820d] mx-auto mb-4"></div>
          <p class="text-zinc-700 dark:text-zinc-300 font-medium">
            Loading shared itinerary...
          </p>
        </div>
      </div>
    );
  }

  // Expired state
  if (state === "expired") {
    return (
      <div class="flex-1 flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <div class="bg-white dark:bg-[#1a1f3c] rounded-lg shadow-lg max-w-md w-full mx-4 p-6 border-2 border-yellow-400">
          <div class="flex items-center gap-3 mb-4">
            <AlertTriangle class="text-yellow-600" size={24} />
            <h1 class="text-lg font-extrabold text-yellow-600">Link Expired</h1>
          </div>
          <p class="text-zinc-700 dark:text-zinc-300 mb-6">
            This share link has expired. Share links are valid for 48 hours.
          </p>
          <button
            onClick={handleGoHome}
            class="w-full bg-[#f5820d] text-white py-2 rounded-lg font-bold hover:bg-orange-500 transition-colors"
          >
            <div class="flex items-center justify-center gap-2">
              <Home size={16} />
              Go Home
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Not found state
  if (state === "not_found") {
    return (
      <div class="flex-1 flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <div class="bg-white dark:bg-[#1a1f3c] rounded-lg shadow-lg max-w-md w-full mx-4 p-6 border-2 border-red-400">
          <div class="flex items-center gap-3 mb-4">
            <AlertTriangle class="text-red-600" size={24} />
            <h1 class="text-lg font-extrabold text-red-600">Not Found</h1>
          </div>
          <p class="text-zinc-700 dark:text-zinc-300 mb-6">
            This share link does not exist or has been removed.
          </p>
          <button
            onClick={handleGoHome}
            class="w-full bg-[#f5820d] text-white py-2 rounded-lg font-bold hover:bg-orange-500 transition-colors"
          >
            <div class="flex items-center justify-center gap-2">
              <Home size={16} />
              Go Home
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div class="flex-1 flex items-center justify-center bg-zinc-100 dark:bg-zinc-950">
        <div class="bg-white dark:bg-[#1a1f3c] rounded-lg shadow-lg max-w-md w-full mx-4 p-6 border-2 border-red-400">
          <div class="flex items-center gap-3 mb-4">
            <AlertTriangle class="text-red-600" size={24} />
            <h1 class="text-lg font-extrabold text-red-600">Error</h1>
          </div>
          <p class="text-zinc-700 dark:text-zinc-300 mb-6">{error}</p>
          <button
            onClick={handleGoHome}
            class="w-full bg-[#f5820d] text-white py-2 rounded-lg font-bold hover:bg-orange-500 transition-colors"
          >
            <div class="flex items-center justify-center gap-2">
              <Home size={16} />
              Go Home
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Success state with itinerary
  return (
    <div class="flex flex-col flex-1 bg-zinc-100 dark:bg-zinc-950">
      {/* Header */}
      <div class="sticky top-0 z-10 bg-white dark:bg-[#1a1f3c] border-b-2 border-[#f5820d] shadow-md">
        <div class="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 class="text-lg font-extrabold text-[#f5820d] dark:text-orange-200">
              Shared Itinerary 🟠
            </h1>
            <p class="text-sm text-zinc-600 dark:text-zinc-400">
              This itinerary was shared with you. Save it to your drafts to keep
              it!
            </p>
          </div>
          <button
            onClick={handleGoHome}
            class="text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-2"
            aria-label="Go home"
          >
            <Home size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <main class="flex-1 overflow-auto p-4">
        <div class="max-w-3xl mx-auto">
          {itinerary && <ItineraryRenderer itinerary={itinerary} />}
        </div>
      </main>

      {/* Action Bar */}
      <div class="sticky bottom-0 bg-white dark:bg-[#1a1f3c] border-t-2 border-[#f5820d] shadow-md p-4">
        <div class="max-w-3xl mx-auto flex gap-3">
          <button
            onClick={handleSaveAsDraft}
            disabled={saving}
            class="flex-1 bg-[#f5820d] text-white py-3 rounded-lg font-bold hover:bg-orange-500 active:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#f5820d] focus:ring-offset-2"
          >
            {saving ? "Saving..." : "Save as My Draft 💾"}
          </button>
          <button
            onClick={handleGoHome}
            class="flex-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-800 dark:text-white py-3 rounded-lg font-bold hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#f5820d] focus:ring-offset-2"
          >
            Back Home
          </button>
        </div>
      </div>
    </div>
  );
}
