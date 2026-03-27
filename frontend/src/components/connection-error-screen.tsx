import { t } from "@/i18n";
import { connectionError } from "@/core/signals";

export function ConnectionErrorScreen() {
  const errorMessage = connectionError.value || "";
  const errorLines = errorMessage.split("\n") || [];

  return (
    <div class="flex flex-col items-center justify-center min-h-dvh px-6 bg-zinc-100 dark:bg-zinc-950 transition-colors">
      <div class="text-5xl mb-4" aria-hidden="true">
        ⚠️
      </div>
      <h1 class="text-xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
        {t("connectionSetupNeeded")}
      </h1>
      <div class="text-sm text-zinc-600 dark:text-zinc-300 mb-4 text-center max-w-md whitespace-pre-line">
        {errorLines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <div class="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-3 max-w-md w-full">
        <p class="mb-1 font-semibold">{t("envKeysExpected")}</p>
        <p>`VITE_REGION`</p>
        <p>`VITE_PROJECT`</p>
        <p>`VITE_AGENT_ID`</p>
      </div>
      <button
        type="button"
        onClick={() => window.location.reload()}
        class="mt-4 px-4 py-2 rounded-lg bg-[#F5820D] text-[#1a1f3c] font-semibold hover:bg-orange-500 transition-colors"
      >
        {t("retryConnection")}
      </button>
    </div>
  );
}
