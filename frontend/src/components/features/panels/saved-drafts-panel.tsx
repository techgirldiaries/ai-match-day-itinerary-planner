import { RotateCcw, Trash2, X } from "lucide-preact";
import { useCallback } from "preact/hooks";
import type { ChatMessage } from "@/core/state";
import {
	currentPage,
	messages,
	savedDrafts,
	showDraftsPanel,
} from "@/core/state";
import { t } from "@/i18n";
import { deleteDraft, updateDraftTitle } from "@/storage/draft-storage";

const PANEL_CLASS =
	"fixed inset-y-0 right-0 w-80 bg-zinc-100 dark:bg-zinc-900 border-l border-zinc-300 " +
	"dark:border-zinc-700 shadow-lg flex flex-col z-40 lg:relative lg:inset-auto lg:border-l";

const HEADER_CLASS =
	"p-4 border-b border-zinc-300 dark:border-zinc-700 flex items-center justify-between";

const DRAFT_ITEM_CLASS =
	"p-4 border-b border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 " +
	"transition-colors cursor-pointer group";

const BUTTON_CLASS =
	"min-h-10 min-w-10 inline-flex items-center justify-center rounded-md " +
	"text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white " +
	"hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none " +
	"focus:ring-2 focus:ring-[#F5820D]";

const ACTION_ROW_CLASS =
	"mt-3 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 " +
	"md:group-focus-within:opacity-100 transition-opacity";

interface SavedDraftsPanelProps {
	mode?: "panel" | "page";
}

export function SavedDraftsPanel({ mode = "panel" }: SavedDraftsPanelProps) {
	const drafts = savedDrafts.value;
	const isPanel = mode === "panel";

	const handleRestoreDraft = useCallback((draftMessages: ChatMessage[]) => {
		messages.value = draftMessages;
		showDraftsPanel.value = false;
		currentPage.value = "chat";
	}, []);

	const handleDeleteDraft = useCallback((draftId: string) => {
		if (confirm(t("ConfirmDeleteDraft") || "Delete this draft?")) {
			deleteDraft(draftId);
			savedDrafts.value = savedDrafts.value.filter((d) => d.id !== draftId);
		}
	}, []);

	const handleRenameDraft = useCallback(
		(draftId: string, currentTitle: string) => {
			const newTitle = prompt(
				t("EnterNewTitle") || "Enter new title:",
				currentTitle,
			);
			if (newTitle && newTitle !== currentTitle) {
				updateDraftTitle(draftId, newTitle);
				savedDrafts.value = savedDrafts.value.map((d) =>
					d.id === draftId ? { ...d, title: newTitle } : d,
				);
			}
		},
		[],
	);

	if (isPanel && !showDraftsPanel.value) return null;

	return (
		<div
			class={
				isPanel
					? PANEL_CLASS
					: "bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-sm flex flex-col min-h-105"
			}
		>
			<div class={HEADER_CLASS}>
				<h3 class="font-semibold text-zinc-900 dark:text-white text-base">
					{t("SavedDrafts") || "Saved Drafts"} ({drafts.length})
				</h3>
				<button
					type="button"
					onClick={() => {
						if (isPanel) {
							showDraftsPanel.value = false;
							return;
						}
						currentPage.value = "chat";
					}}
					class="min-h-10 min-w-10 inline-flex items-center justify-center rounded-md text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#F5820D]"
					aria-label={t("closeLabel")}
					title={t("closeLabel")}
				>
					<X size={18} aria-hidden="true" />
				</button>
			</div>

			<div class="flex-1 overflow-y-auto scrollbar-hide min-h-0">
				{drafts.length === 0 && (
					<div class="p-6 text-sm text-zinc-500 dark:text-zinc-400">
						{t("SelectDraftToRestore")}
					</div>
				)}
				{drafts.map((draft) => (
					<div key={draft.id} class={DRAFT_ITEM_CLASS}>
						<div class="mb-2">
							<button
								type="button"
								class="w-full text-left font-semibold text-zinc-900 dark:text-white truncate hover:underline focus:outline-none focus:ring-2 focus:ring-[#F5820D] rounded-sm"
								onClick={() => handleRestoreDraft(draft.messages)}
								title={draft.title}
							>
								{draft.title}
							</button>
							<p class="text-sm text-zinc-700 dark:text-zinc-300 mt-1">
								{new Date(draft.updatedAt).toLocaleDateString()} (
								{draft.messages.length} messages)
							</p>
						</div>

						<div class={ACTION_ROW_CLASS}>
							<button
								type="button"
								onClick={() => handleRestoreDraft(draft.messages)}
								class={BUTTON_CLASS}
								title={t("RestoreDraft") || "Restore"}
							>
								<RotateCcw size={16} />
							</button>
							<button
								type="button"
								onClick={() => handleRenameDraft(draft.id, draft.title)}
								class={BUTTON_CLASS}
								title={t("Rename") || "Rename"}
							>
								âœŽ
							</button>
							<button
								type="button"
								onClick={() => handleDeleteDraft(draft.id)}
								class={BUTTON_CLASS}
								title={t("Delete") || "Delete"}
							>
								<Trash2 size={16} />
							</button>
						</div>
					</div>
				))}
			</div>

			<div class="p-4 border-t border-zinc-300 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-400">
				{t("SelectDraftToRestore") ||
					"Click a draft to restore or hover for options"}
			</div>
		</div>
	);
}
