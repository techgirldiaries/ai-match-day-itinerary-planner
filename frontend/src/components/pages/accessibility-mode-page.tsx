export function AccessibilityModePage() {
  return (
    <div class="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div class="mb-8">
        <h3 class="text-2xl font-extrabold text-[#f5820d] dark:text-orange-300 mb-2">
          ♿ Make It Simpler to Use
        </h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article class="rounded-xl border-2 border-[#f5820d] dark:border-orange-400 bg-white dark:bg-[#1a1f3c] p-6 shadow-md">
          <div class="flex items-start gap-3 mb-3">
            <h4 class="text-lg font-bold text-[#f5820d] dark:text-orange-300">
              🔤 Enlarge Text Size
            </h4>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Make the text larger and easier to read throughout the application
          </p>
        </article>

        <article class="rounded-xl border-2 border-[#f5820d] dark:border-orange-400 bg-white dark:bg-[#1a1f3c] p-6 shadow-md">
          <div class="flex items-start gap-3 mb-3">
            <h4 class="text-lg font-bold text-[#f5820d] dark:text-orange-300">
              🎨 Bold Colours & Text
            </h4>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Increase colour contrast to make everything stand out better
          </p>
        </article>

        <article class="rounded-xl border-2 border-[#f5820d] dark:border-orange-400 bg-white dark:bg-[#1a1f3c] p-6 shadow-md">
          <div class="flex items-start gap-3 mb-3">
            <h4 class="text-lg font-bold text-[#f5820d] dark:text-orange-300">
              🎵 Text-to-Speech Support
            </h4>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Have the application read text aloud for you as you navigate
          </p>
        </article>

        <article class="rounded-xl border-2 border-[#f5820d] dark:border-orange-400 bg-white dark:bg-[#1a1f3c] p-6 shadow-md">
          <div class="flex items-start gap-3 mb-3">
            <h4 class="text-lg font-bold text-[#f5820d] dark:text-orange-300">
              ⌨️ Navigate Using Keyboard
            </h4>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Use your keyboard to navigate the application instead of a mouse
          </p>
        </article>
      </div>

      <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h3 class="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">
          💡 Helpful Tip
        </h3>
        <p class="text-sm text-blue-800 dark:text-blue-200">
          You can combine multiple accessibility features together to create the
          perfect setup for your needs. Try them out and discover what works
          best for you!
        </p>
      </div>
    </div>
  );
}
