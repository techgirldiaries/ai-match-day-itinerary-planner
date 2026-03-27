import * as Avatar from "@radix-ui/react-avatar";
import TimeAgo from "react-timeago";
import type { ChatMessage } from "@/core/signals";

const USER_FALLBACK_CLASS =
  "p-2 bg-emerald-200 dark:bg-emerald-800 text-emerald-900 " +
  "dark:text-emerald-100 font-semibold rounded-full transition-colors";

interface UserMessageProps {
  message: ChatMessage;
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div class="flex items-start gap-x-2 max-w-[92%] sm:max-w-[85%] lg:max-w-[65%] self-end flex-row-reverse w-fit">
      <div class="shrink-0">
        <Avatar.Root>
          <Avatar.Image
            src="/default-user-avatar.png"
            class="size-10 rounded-full border border-zinc-200 dark:border-zinc-700"
          />
          <Avatar.Fallback asChild>
            <div class={USER_FALLBACK_CLASS}>ME</div>
          </Avatar.Fallback>
        </Avatar.Root>
      </div>
      <div class="flex flex-col gap-y-1 items-end max-w-full">
        <small class="flex gap-x-1.5 flex-row-reverse">
          <span class="text-zinc-700 dark:text-zinc-300">You</span>{" "}
          {message.id === "optimistic" ? (
            <span class="text-zinc-500 dark:text-zinc-400">sending...</span>
          ) : (
            <span class="text-zinc-500 dark:text-zinc-400">
              <TimeAgo date={message.createdAt} />
            </span>
          )}
        </small>
        <div class="py-2 px-4 rounded-3xl rounded-tr-xs bg-[#1a1f3c] text-white transition-colors max-w-full">
          <p class="text-end whitespace-pre-wrap wrap-break-word">
            {message.text}
          </p>
        </div>
      </div>
    </div>
  );
}
