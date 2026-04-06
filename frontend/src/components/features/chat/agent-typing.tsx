import { Avatar } from "@/components/common";
import { CSS_CLASSES } from "@/config/formConfig";
import { agentAvatar, agentInitials, agentName } from "@/core/signals";
import { t } from "@/i18n";

function AgentAvatar() {
  return (
    <Avatar.Root>
      <Avatar.Image
        src={agentAvatar.value}
        class="size-10 rounded-full border border-zinc-200 dark:border-zinc-700"
        alt=""
      />
      <Avatar.Fallback class={CSS_CLASSES.avatarFallback}>
        {agentInitials.value ?? "🤖"}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}

export function AgentTyping() {
  return (
    <output
      class="flex items-start gap-x-2 max-w-4/6 self-start border-l-4 border-[#f5820d] pl-2 bg-orange-50 dark:bg-[#1a1f3c]/60"
      aria-live="polite"
      aria-label="Hatters Away agents are planning your trip"
    >
      <div class="shrink-0" aria-hidden="true">
        <AgentAvatar />
      </div>
      <div class="flex flex-col gap-y-1 items-start">
        <small class="flex gap-x-1.5">
          <span class="text-[#f5820d] dark:text-orange-300 font-bold transition-colors">
            {agentName}
          </span>{" "}
          <span class="text-[#1a1f3c] dark:text-orange-200 transition-colors font-medium">
            {t("agentPlanningTrip")} – Planning your match-day experience 🟧⚪
          </span>
        </small>
        <div class="py-3 px-4 rounded-3xl rounded-tl-xs bg-[#f5820d]/10 dark:bg-[#1a1f3c] transition-colors border border-[#f5820d] dark:border-orange-400">
          <div class="flex items-center gap-2">
            <div class="flex" aria-hidden="true">
              <span class="typing-dot text-[#f5820d] dark:text-orange-300">
                •
              </span>
              <span class="typing-dot typing-dot-delay-1 text-[#f5820d] dark:text-orange-300">
                •
              </span>
              <span class="typing-dot typing-dot-delay-2 text-[#f5820d] dark:text-orange-300">
                •
              </span>
            </div>
            <span class="text-xs text-zinc-500 dark:text-zinc-400">
              {t("agentWorking")}
            </span>
          </div>
        </div>
      </div>
    </output>
  );
}

export function TimeoutMessage() {
  return (
    <div
      class="flex items-start gap-x-2 max-w-4/6 self-start"
      role="alert"
      aria-live="assertive"
    >
      <div class="shrink-0" aria-hidden="true">
        <AgentAvatar />
      </div>
      <div class="flex flex-col gap-y-1 items-start">
        <small class="text-zinc-700 dark:text-zinc-300">{agentName}</small>
        <div class="py-3 px-4 rounded-3xl rounded-tl-xs bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
          <p class="text-sm text-amber-800 dark:text-amber-300">
            {t("agentTimeout")}
          </p>
        </div>
      </div>
    </div>
  );
}
