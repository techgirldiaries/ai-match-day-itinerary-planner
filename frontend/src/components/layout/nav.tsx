import {
  Clock3,
  Download,
  Eye,
  History,
  Mail,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Save,
  Share2,
  Sun,
  X,
} from "lucide-preact";
import {
  type AppPage,
  agentTypingTimedOut,
  currentPage,
  draftMessage,
  hasMessages,
  hasUserMessageBeenAdded,
  isDarkMode,
  intakeFormData,
  intakeMessages,
  isAgentThinking,
  isAgentTyping,
  isIntakeComplete,
  isIntakeSubmitting,
  isProcessingIntake,
  isSending,
  isSidebarCollapsed,
  isSidebarOpen,
  itineraryOutput,
  messages,
  savedDrafts,
  showEmailExportModal,
  showShareModal,
} from "@/core/state";
import { type Translations, t } from "@/i18n";
import { saveDraft } from "@/storage/draft-storage";
import {
  clearSessionMessages,
  clearIntakeMessages,
} from "@/storage/messageStorage";

const SIDEBAR_BUTTON_CLASS =
  "p-2 rounded-lg text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 " +
  "transition-colors focus:outline-none " +
  "focus:ring-2 focus:ring-orange-500";

interface NavItem {
  page: AppPage;
  icon: string;
  labelKey: keyof Translations;
}

const NAV_ITEMS: NavItem[] = [
  { page: "intake", icon: "🟧", labelKey: "navPlan" },
  { page: "agents", icon: "🤖", labelKey: "navAllAgents" },
];

function getNavItem(page: AppPage): NavItem {
  if (page === "drafts") {
    return {
      page: "chat",
      icon: "🗂️",
      labelKey: "SavedDrafts",
    };
  }
  if (page === "coming-soon") {
    return {
      page: "chat",
      icon: "🛠️",
      labelKey: "navComingSoon",
    };
  }
  return NAV_ITEMS.find((item) => item.page === page) ?? NAV_ITEMS[0];
}

function NavTab({
  page,
  icon,
  labelKey,
  collapsed,
}: NavItem & { collapsed: boolean }) {
  const isActive = currentPage.value === page;
  const label = t(labelKey);

  return (
    <button
      type="button"
      onClick={() => {
        // Only clear messages when navigating to chat
        if (page === "chat") {
          messages.value = [];
          draftMessage.value = "";
          showEmailExportModal.value = false;
        }
        // When navigating to intake, don't clear messages
        currentPage.value = page;
        isSidebarOpen.value = false;
      }}
      class={[
        "w-full min-h-11 flex items-center rounded-lg text-sm font-bold transition-colors shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900",
        collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2",
        isActive
          ? "bg-orange-500 text-white border-2 border-orange-500"
          : "text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400 border border-orange-500",
      ].join(" ")}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? label : undefined}
      aria-label={label}
    >
      <span aria-hidden="true">{icon}</span>
      {!collapsed && <span class="truncate">{label}</span>}
    </button>
  );
}

function NewChatTab({ collapsed }: { collapsed: boolean }) {
  return (
    <button
      type="button"
      onClick={() => {
        // Clear chat state
        messages.value = [];
        intakeMessages.value = [];
        draftMessage.value = "";

        // Reset UI states
        showEmailExportModal.value = false;
        isSidebarOpen.value = false;

        // Clear storage
        clearSessionMessages();
        clearIntakeMessages();

        // Reset agent/chat interaction states
        isAgentTyping.value = false;
        agentTypingTimedOut.value = false;
        isAgentThinking.value = false;
        isSending.value = false;
        hasUserMessageBeenAdded.value = false;

        // Reset intake form states
        isIntakeSubmitting.value = false;
        isIntakeComplete.value = false;
        isProcessingIntake.value = false;
        intakeFormData.value = null;
        itineraryOutput.value = null;

        // Set page to chat
        currentPage.value = "chat";
      }}
      class={[
        "w-full min-h-11 flex items-center rounded-lg text-sm font-bold transition-colors shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900",
        collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2",
        currentPage.value === "chat" && !hasMessages.value
          ? "bg-orange-500 text-white border-2 border-orange-500"
          : "text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400 border border-orange-500",
      ].join(" ")}
      aria-label={t("newConversation")}
      title={collapsed ? t("newConversation") : undefined}
    >
      <Plus size={16} aria-hidden="true" />
      {!collapsed && <span class="truncate">{t("newConversation")}</span>}
    </button>
  );
}

function DraftsTab({ collapsed }: { collapsed: boolean }) {
  const draftsCount = savedDrafts.value.length;
  const label = `${t("SavedDrafts")} (${draftsCount})`;
  const isActive = currentPage.value === "drafts";

  return (
    <button
      type="button"
      onClick={() => {
        currentPage.value = "drafts";
        isSidebarOpen.value = false;
      }}
      class={[
        "w-full min-h-11 flex items-center rounded-lg text-sm font-bold transition-colors shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900",
        collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2",
        isActive
          ? "bg-orange-500 text-white border-2 border-orange-500"
          : "text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400 border border-orange-500",
      ].join(" ")}
      title={collapsed ? label : undefined}
      aria-label={label}
    >
      <History size={16} aria-hidden="true" />
      {!collapsed && <span class="truncate">{label}</span>}
    </button>
  );
}

interface ActionTabProps {
  collapsed: boolean;
  icon: typeof Save;
  labelKey: keyof Translations;
  onClick: () => void;
  disabled?: boolean;
}

function escapeICSText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatICSDateUTC(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`;
}

function parseMatchDateTimeFromMessages(): Date | null {
  const combined = messages.value.map((m) => m.text).join("\n");

  const isoDateMatch = combined.match(/match date:\s*(\d{4}-\d{2}-\d{2})/i);
  const ukDateMatch = combined.match(
    /match date:\s*(\d{1,2}\/\d{1,2}\/\d{4})/i,
  );
  const timeMatch = combined.match(
    /(?:kick-?off|match time):\s*(\d{1,2}:\d{2})/i,
  );

  const timeValue = timeMatch?.[1] ?? "15:00";
  const [hoursRaw, minutesRaw] = timeValue.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (isoDateMatch?.[1]) {
    const date = new Date(`${isoDateMatch[1]}T00:00:00`);
    date.setHours(hours, minutes, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (ukDateMatch?.[1]) {
    const [dayRaw, monthRaw, yearRaw] = ukDateMatch[1].split("/");
    const day = Number(dayRaw);
    const monthIndex = Number(monthRaw) - 1;
    const year = Number(yearRaw);
    const date = new Date(year, monthIndex, day, hours, minutes, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function ActionTab({
  collapsed,
  icon: Icon,
  labelKey,
  onClick,
  disabled = false,
}: ActionTabProps) {
  const label = t(labelKey);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      class={[
        "w-full min-h-11 flex items-center rounded-lg text-sm font-bold transition-colors shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900",
        collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2",
        "text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400 border border-orange-500",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
      title={collapsed ? label : undefined}
      aria-label={label}
    >
      <Icon size={16} aria-hidden="true" />
      {!collapsed && <span class="truncate">{label}</span>}
    </button>
  );
}

function downloadItinerary() {
  const start = parseMatchDateTimeFromMessages() ?? new Date();
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const stamp = new Date();

  const summary = escapeICSText(t("calendarEventSummary"));
  const description = escapeICSText(
    `${t("calendarEventDescription")}\n\n${messages.value
      .map((m) => `[${new Date(m.createdAt).toLocaleString()}] ${m.text}`)
      .join("\n")}`,
  );
  const uid = `${Date.now()}-${Math.random().toString(16).slice(2)}@hatters-away`;

  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hatters Away//LTFC Itinerary//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatICSDateUTC(stamp)}`,
    `DTSTART:${formatICSDateUTC(start)}`,
    `DTEND:${formatICSDateUTC(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `${t("appName").toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.ics`;

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function DesktopSidebar() {
  const collapsed = isSidebarCollapsed.value;

  return (
    <aside
      class={[
        "hidden lg:flex fixed left-0 top-0 bottom-0 border-r border-gray-300 dark:border-gray-800",
        "bg-gray-50 dark:bg-gray-900 z-20 transition-[width] duration-200",
        collapsed ? "w-16" : "w-64",
      ].join(" ")}
    >
      <div class="w-full p-3 flex flex-col gap-3">
        {/* Top controls */}
        <div class={collapsed ? "flex justify-center" : "flex justify-end"}>
          <button
            type="button"
            class={SIDEBAR_BUTTON_CLASS}
            onClick={() => {
              isSidebarCollapsed.value = !isSidebarCollapsed.value;
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={18} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={18} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Navigation block */}
        <div>
          <nav class="space-y-1" aria-label="Sidebar navigation">
            {NAV_ITEMS.map((item) => (
              <NavTab key={item.page} {...item} collapsed={collapsed} />
            ))}
            <NewChatTab collapsed={collapsed} />
            <ActionTab
              collapsed={collapsed}
              icon={Save}
              labelKey="navSaveDraft"
              onClick={() => {
                const draft = saveDraft(messages.value);
                savedDrafts.value = [...savedDrafts.value, draft];
                currentPage.value = "chat";
                isSidebarOpen.value = false;
              }}
              disabled={!hasMessages.value}
            />
            <ActionTab
              collapsed={collapsed}
              icon={Mail}
              labelKey="navSendEmail"
              onClick={() => {
                currentPage.value = "chat";
                showEmailExportModal.value = true;
                isSidebarOpen.value = false;
              }}
              disabled={!hasMessages.value}
            />
            <ActionTab
              collapsed={collapsed}
              icon={Share2}
              labelKey="navShareGroup"
              onClick={() => {
                currentPage.value = "chat";
                showShareModal.value = true;
                isSidebarOpen.value = false;
              }}
              disabled={!hasMessages.value}
            />
            <ActionTab
              collapsed={collapsed}
              icon={Download}
              labelKey="navDownload"
              onClick={() => {
                currentPage.value = "chat";
                downloadItinerary();
                isSidebarOpen.value = false;
              }}
              disabled={!hasMessages.value}
            />
            <DraftsTab collapsed={collapsed} />
          </nav>
        </div>

        <div class="mt-auto pt-2 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            class={[
              "w-full min-h-11 flex items-center rounded-lg text-sm font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-orange-500",
              "text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800",
              collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2",
              currentPage.value === "coming-soon"
                ? "bg-orange-500 text-white"
                : "",
            ].join(" ")}
            onClick={() => {
              currentPage.value = "coming-soon";
              isSidebarOpen.value = false;
            }}
            aria-label={t("navComingSoon")}
            title={collapsed ? t("navComingSoon") : undefined}
          >
            <Clock3 size={16} aria-hidden="true" />
            {!collapsed && <span>{t("navComingSoon")}</span>}
          </button>

          <button
            type="button"
            class={[
              "w-full min-h-11 flex items-center rounded-lg text-sm font-medium transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-orange-500",
              "text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800",
              collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2",
              currentPage.value === "accessibility-mode"
                ? "bg-orange-500 text-white"
                : "",
            ].join(" ")}
            onClick={() => {
              currentPage.value = "accessibility-mode";
              isSidebarOpen.value = false;
            }}
            aria-label="Accessibility Mode"
            title={collapsed ? "Accessibility Mode" : undefined}
          >
            <Eye size={16} aria-hidden="true" />
            {!collapsed && <span>Accessibility Mode</span>}
          </button>

          <button
            type="button"
            class={[
              "w-full flex items-center rounded-lg text-sm font-medium transition-colors",
              "text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800",
              "focus:outline-none focus:ring-2 focus:ring-orange-500",
              collapsed ? "justify-center px-2 py-2" : "gap-2 px-3 py-2",
            ].join(" ")}
            onClick={() => {
              isDarkMode.value = !isDarkMode.value;
            }}
            aria-label={
              isDarkMode.value ? "Switch to light mode" : "Switch to dark mode"
            }
            title={
              collapsed
                ? isDarkMode.value
                  ? "Switch to light mode"
                  : "Switch to dark mode"
                : undefined
            }
          >
            {isDarkMode.value ? (
              <Sun size={16} aria-hidden="true" />
            ) : (
              <Moon size={16} aria-hidden="true" />
            )}
            {!collapsed && (
              <span>{isDarkMode.value ? "Light mode" : "Dark mode"}</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileSidebar() {
  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen.value && (
        <button
          type="button"
          aria-label="Close navigation menu"
          class="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => {
            isSidebarOpen.value = false;
          }}
        />
      )}

      {/* Mobile drawer */}
      <aside
        class={[
          "lg:hidden fixed top-0 left-0 bottom-0 w-72 max-w-[85vw]",
          "border-r border-gray-300 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 z-40",
          "transform transition-transform duration-200",
          isSidebarOpen.value ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div class="p-4 h-full overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">
              Menu
            </p>
            <button
              type="button"
              class={SIDEBAR_BUTTON_CLASS}
              onClick={() => {
                isSidebarOpen.value = false;
              }}
              aria-label="Close menu"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <nav class="space-y-1" aria-label="Mobile sidebar navigation">
            {NAV_ITEMS.map((item) => (
              <NavTab key={item.page} {...item} collapsed={false} />
            ))}
            <NewChatTab collapsed={false} />
            <ActionTab
              collapsed={false}
              icon={Save}
              labelKey="navSaveDraft"
              onClick={() => {
                const draft = saveDraft(messages.value);
                savedDrafts.value = [...savedDrafts.value, draft];
                currentPage.value = "chat";
                isSidebarOpen.value = false;
              }}
              disabled={!hasMessages.value}
            />
            <ActionTab
              collapsed={false}
              icon={Mail}
              labelKey="navSendEmail"
              onClick={() => {
                currentPage.value = "chat";
                showEmailExportModal.value = true;
                isSidebarOpen.value = false;
              }}
              disabled={!hasMessages.value}
            />
            <ActionTab
              collapsed={false}
              icon={Share2}
              labelKey="navShareGroup"
              onClick={() => {
                currentPage.value = "chat";
                showShareModal.value = true;
                isSidebarOpen.value = false;
              }}
              disabled={!hasMessages.value}
            />
            <ActionTab
              collapsed={false}
              icon={Download}
              labelKey="navDownload"
              onClick={() => {
                currentPage.value = "chat";
                downloadItinerary();
                isSidebarOpen.value = false;
              }}
              disabled={!hasMessages.value}
            />
            <DraftsTab collapsed={false} />
          </nav>

          <div class="mt-4 pt-3 border-t border-gray-800">
            <button
              type="button"
              class={[
                "w-full min-h-11 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-orange-500",
                currentPage.value === "coming-soon"
                  ? "bg-orange-500 text-white"
                  : "text-gray-300 hover:bg-gray-800",
              ].join(" ")}
              onClick={() => {
                currentPage.value = "coming-soon";
                isSidebarOpen.value = false;
              }}
              aria-label={t("navComingSoon")}
            >
              <Clock3 size={16} aria-hidden="true" />
              <span>{t("navComingSoon")}</span>
            </button>

            <button
              type="button"
              class={[
                "w-full min-h-11 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-orange-500",
                currentPage.value === "accessibility-mode"
                  ? "bg-orange-500 text-white"
                  : "text-gray-300 hover:bg-gray-800",
              ].join(" ")}
              onClick={() => {
                currentPage.value = "accessibility-mode";
                isSidebarOpen.value = false;
              }}
              aria-label="Accessibility Mode"
            >
              <Eye size={16} aria-hidden="true" />
              <span>Accessibility Mode</span>
            </button>

            <button
              type="button"
              class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              onClick={() => {
                isDarkMode.value = !isDarkMode.value;
              }}
              aria-label={
                isDarkMode.value
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {isDarkMode.value ? (
                <Sun size={16} aria-hidden="true" />
              ) : (
                <Moon size={16} aria-hidden="true" />
              )}
              <span>{isDarkMode.value ? "Light mode" : "Dark mode"}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Nav() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
