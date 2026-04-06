import { SendHorizonal } from "lucide-preact";
import type { SubmitEventHandler } from "preact";
import { useCallback } from "preact/hooks";
import { useSendMessage } from "@/components/hooks/useSendMessage";
import {
	agent,
	type ChatMessage,
	draftMessage,
	isAgentTyping,
	messages,
	task,
	workforce,
} from "@/core/state";
import { t } from "@/i18n";

const FOOTER_CLASS =
	"p-2 sm:p-3 md:p-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] border-t sticky bottom-0 " +
	"bg-white dark:bg-gray-900 border-gray-200 dark:border-orange-500 transition-colors shadow-lg";
const INPUT_CLASS =
	"flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 " +
	"px-3 sm:px-4 py-2 sm:py-3 rounded-full text-xs sm:text-sm text-gray-900 dark:text-white " +
	"placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none " +
	"focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 dark:focus:ring-offset-gray-900";
const SEND_BUTTON_CLASS =
	"bg-orange-500 text-white rounded-full p-2 sm:p-3 cursor-pointer " +
	"hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 " +
	"disabled:cursor-not-allowed transition-colors focus:outline-none " +
	"focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 font-bold shadow-md";

export function Footer() {
	const { input, sendMessage } = useSendMessage();

	const handleSubmit = useCallback<SubmitEventHandler<HTMLFormElement>>(
		async (e) => {
			e.preventDefault();
			const form = e.currentTarget;
			const data = new FormData(form);
			const message = data.get("message") as string | null;
			await sendMessage(message || "");
		},
		[sendMessage],
	);

	return (
		<footer class={FOOTER_CLASS}>
			<div class="max-w-4xl mx-auto">
				<form
					class="flex items-center gap-x-2"
					onSubmit={handleSubmit}
					aria-label={t("followUpLabel")}
				>
					<label for="chat-input" class="sr-only">
						{t("followUpLabel")}
					</label>
					<input
						id="chat-input"
						ref={input}
						type="text"
						onInput={(e) => {
							draftMessage.value = (e.currentTarget as HTMLInputElement).value;
						}}
						placeholder={
							"Share your Hatters plansâ€¦ (e.g. meet at Kenilworth Stadium Road!)"
						}
						class={INPUT_CLASS}
						name="message"
						autoComplete="off"
					/>
					<button
						type="submit"
						disabled={isAgentTyping.value}
						class={SEND_BUTTON_CLASS}
						aria-label={t("sendMessage")}
					>
						<SendHorizonal size={24} strokeWidth={1.5} aria-hidden="true" />
					</button>
				</form>
			</div>
		</footer>
	);
}
