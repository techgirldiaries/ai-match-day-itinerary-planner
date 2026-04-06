import { draftMessage } from "@/core/state";
import { t } from "@/i18n";

export function UserDraftBubble() {
	if (!draftMessage.value.trim()) return null;
	return (
		<div class="flex items-start gap-x-2 pl-12 md:pl-0 md:max-w-4/6 self-end flex-row-reverse opacity-80 max-w-full">
			<div class="flex flex-col gap-y-1 items-end max-w-full">
				<small class="text-zinc-500 dark:text-zinc-400">
					{t("youAreTyping")}
				</small>
				<div class="py-2 px-4 rounded-3xl rounded-tr-xs bg-[#1a1f3c] text-white transition-colors max-w-full">
					<p class="text-end whitespace-pre-wrap wrap-break-word">
						{draftMessage.value}
					</p>
				</div>
			</div>
		</div>
	);
}
