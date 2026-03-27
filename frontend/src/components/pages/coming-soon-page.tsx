import { t } from "@/i18n";

interface ComingSoonAgentItem {
  id: number;
  icon: string;
  nameKey:
    | "agent7Name"
    | "agent8Name"
    | "agent9Name"
    | "agent10Name"
    | "agent11Name"
    | "agent12Name";
  descKey:
    | "agent7Desc"
    | "agent8Desc"
    | "agent9Desc"
    | "agent10Desc"
    | "agent11Desc"
    | "agent12Desc";
  statusKey: "statusPlanned" | "statusInProgress" | "statusBeta";
}

const AGENTS: ComingSoonAgentItem[] = [
  {
    id: 7,
    icon: "🏛️",
    nameKey: "agent7Name",
    descKey: "agent7Desc",
    statusKey: "statusInProgress",
  },
  {
    id: 8,
    icon: "⚽",
    nameKey: "agent8Name",
    descKey: "agent8Desc",
    statusKey: "statusPlanned",
  },
  {
    id: 9,
    icon: "🤝",
    nameKey: "agent9Name",
    descKey: "agent9Desc",
    statusKey: "statusPlanned",
  },
  {
    id: 10,
    icon: "📊",
    nameKey: "agent10Name",
    descKey: "agent10Desc",
    statusKey: "statusBeta",
  },
  {
    id: 11,
    icon: "👦",
    nameKey: "agent11Name",
    descKey: "agent11Desc",
    statusKey: "statusPlanned",
  },
  {
    id: 12,
    icon: "☁️",
    nameKey: "agent12Name",
    descKey: "agent12Desc",
    statusKey: "statusInProgress",
  },
];

function statusClass(statusKey: ComingSoonAgentItem["statusKey"]): string {
  if (statusKey === "statusInProgress") {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  }
  if (statusKey === "statusBeta") {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
  }
  return "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300";
}

export function ComingSoonPage() {
  return (
    <div class="max-w-4xl mx-auto px-4 py-6">
      <div class="mb-6">
        <h2 class="text-2xl font-extrabold text-[#f5820d] dark:text-orange-300">
          {t("comingSoonTitle")} <span class="ml-2">COYH 🟠⚪</span>
        </h2>
        <p class="text-sm text-[#1a1f3c] dark:text-orange-200 mt-2 font-medium">
          {t("comingSoonSubtitle")}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AGENTS.map((agent) => (
          <article
            key={agent.id}
            class="rounded-xl border-2 border-[#f5820d] dark:border-orange-400 bg-white dark:bg-[#1a1f3c] p-4 shadow-md"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-bold text-[#f5820d] dark:text-orange-300 truncate">
                  <span aria-hidden="true" class="mr-2">
                    {agent.icon}
                  </span>
                  {t(agent.nameKey)}
                </p>
                <p class="text-xs text-[#1a1f3c] dark:text-orange-200 mt-1 leading-relaxed">
                  {t(agent.descKey)}
                </p>
              </div>
              <span
                class={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${statusClass(agent.statusKey)}`}
              >
                {t(agent.statusKey)}
              </span>
            </div>
          </article>
        ))}
      </div>

      <p class="text-xs text-[#f5820d] dark:text-orange-300 mt-5 font-semibold">
        {t("comingSoonHint")}
        <br />
        <span class="block mt-2">
          Find us at Kenilworth Stadium Road for a chat about the future of
          Hatters Away!
        </span>
      </p>
    </div>
  );
}
