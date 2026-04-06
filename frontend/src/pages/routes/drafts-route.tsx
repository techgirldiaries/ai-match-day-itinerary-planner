import { SavedDraftsPanel } from "@/components/features/panels";

export function DraftsRoute() {
  return (
    <main
      class="flex-1 bg-zinc-100 dark:bg-zinc-950 transition-colors overflow-y-auto p-4"
      id="main-content"
    >
      <div class="max-w-3xl mx-auto">
        <SavedDraftsPanel mode="page" />
      </div>
    </main>
  );
}
