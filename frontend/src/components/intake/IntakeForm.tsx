import { FunctionComponent } from "preact";
import { useState } from "preact/hooks";
import type {
  IntakeFormDataNew,
  IntakeValidationError,
  MatchTicketType,
  TravelModeNew,
  GroupType,
  IntakeFanType,
} from "../../core/types";
import {
  intakeFormData,
  isIntakeSubmitting,
  isIntakeComplete,
  currentRoute,
} from "../../core/signals";
import { validateIntakeForm } from "../../core/intake-validation";
import { TRANSPORT_OPTIONS } from "../../config/formConfig";

// Default empty form state — all fields explicit, no 'any':
const defaultFormState: IntakeFormDataNew = {
  matchDate: "",
  kickoffTime: "",
  opponent: "",
  ticketType: "home",
  fanType: "loyal-hatter",
  groupType: "solo",
  groupSize: 1,
  travelModes: ["train"],
  departureLocation: "",
  prefersPubPreMatch: false,
  prefersFood: false,
  prefersShoppingAreas: false,
  prefersAttractionSites: false,
  prefersLocationHistory: false,
  prefersParkingRecommendations: false,
  accessibilityNeeds: "",
  budgetPerPerson: 20,
  additionalNotes: "",
};

export const IntakeForm: FunctionComponent = () => {
  const [formState, setFormState] =
    useState<IntakeFormDataNew>(defaultFormState);

  const [validationErrors, setValidationErrors] = useState<
    IntakeValidationError[]
  >([]);

  // Typed field updater — key must be keyof IntakeFormDataNew:
  const updateField = <K extends keyof IntakeFormDataNew>(
    key: K,
    value: IntakeFormDataNew[K],
  ): void => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field on change:
    setValidationErrors((prev) => prev.filter((e) => e.field !== key));
  };

  const getFieldError = (
    field: keyof IntakeFormDataNew,
  ): string | undefined => {
    return validationErrors.find((e) => e.field === field)?.message;
  };

  const toggleTravelMode = (mode: TravelModeNew) => {
    updateField(
      "travelModes",
      formState.travelModes.includes(mode)
        ? formState.travelModes.filter((m) => m !== mode)
        : [...formState.travelModes, mode],
    );
  };

  const handleSubmit = (): void => {
    // Mutex — prevent double submission:
    if (isIntakeSubmitting.value) return;

    const result = validateIntakeForm(formState);

    if (!result.isValid) {
      setValidationErrors(result.errors);
      return;
    }

    isIntakeSubmitting.value = true;

    // Store validated intake data in signal:
    intakeFormData.value = formState;
    isIntakeComplete.value = true;

    // Transition to chat — ChatRoute will auto-trigger
    // agent processing on mount:
    currentRoute.value = "chat";
    isIntakeSubmitting.value = false;
  };

  return (
    <div
      class="min-h-screen bg-white dark:bg-gray-950 flex items-center 
                justify-center px-4 py-8"
    >
      <div
        class="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl 
                  border border-orange-500/20 p-6 sm:p-8"
      >
        {/* Header */}
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-orange-500 mb-1">
            Plan Your Match Day
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Come On You Hatters! Tell us about your visit to Kenilworth Road
          </p>
        </div>

        {/* Form fields — no HTML form tag per Preact rules */}
        <div class="flex flex-col gap-5">
          {/* Departure Location */}
          <div class="flex flex-col gap-1">
            <label
              for="departureLocation"
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Departure Location *
            </label>
            <input
              id="departureLocation"
              type="text"
              value={formState.departureLocation}
              placeholder="e.g. Luton Town Centre"
              onInput={(e) =>
                updateField(
                  "departureLocation",
                  (e.target as HTMLInputElement).value,
                )
              }
              class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm
                     focus:border-orange-500 dark:focus:border-orange-400 outline-none"
            />
            {getFieldError("departureLocation") !== undefined && (
              <span class="text-xs text-red-600 dark:text-red-400">
                {getFieldError("departureLocation")}
              </span>
            )}
          </div>

          {/* Match Date */}
          <div class="flex flex-col gap-1">
            <label
              for="matchDate"
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Match Date *
            </label>
            <input
              id="matchDate"
              type="date"
              value={formState.matchDate}
              onInput={(e) =>
                updateField("matchDate", (e.target as HTMLInputElement).value)
              }
              class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                    rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm
                    focus:border-orange-500 dark:focus:border-orange-400 outline-none"
            />
            {getFieldError("matchDate") !== undefined && (
              <span class="text-xs text-red-600 dark:text-red-400">
                {getFieldError("matchDate")}
              </span>
            )}
          </div>

          {/* Kickoff Time */}
          <div class="flex flex-col gap-1">
            <label
              for="kickoffTime"
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Kickoff Time *
            </label>
            <input
              id="kickoffTime"
              type="time"
              value={formState.kickoffTime}
              onInput={(e) =>
                updateField("kickoffTime", (e.target as HTMLInputElement).value)
              }
              class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                    rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm
                    focus:border-orange-500 dark:focus:border-orange-400 outline-none"
            />
            {getFieldError("kickoffTime") !== undefined && (
              <span class="text-xs text-red-600 dark:text-red-400">
                {getFieldError("kickoffTime")}
              </span>
            )}
          </div>

          {/* Opponent */}
          <div class="flex flex-col gap-1">
            <label
              for="opponent"
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Opponent *
            </label>
            <input
              id="opponent"
              type="text"
              value={formState.opponent}
              placeholder='e.g. "Burnley FC" or "TBD" if unknown'
              onInput={(e) =>
                updateField("opponent", (e.target as HTMLInputElement).value)
              }
              class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                    rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm
                    focus:border-orange-500 dark:focus:border-orange-400 outline-none"
            />
            {getFieldError("opponent") !== undefined && (
              <span class="text-xs text-red-600 dark:text-red-400">
                {getFieldError("opponent")}
              </span>
            )}
          </div>

          {/* Ticket Type */}
          <div class="flex flex-col gap-1">
            <label
              for="ticketType"
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Ticket Type *
            </label>
            <select
              id="ticketType"
              aria-label="Ticket Type"
              value={formState.ticketType}
              onChange={(e) =>
                updateField(
                  "ticketType",
                  (e.target as HTMLSelectElement).value as MatchTicketType,
                )
              }
              class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                    rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm
                    focus:border-orange-500 dark:focus:border-orange-400 outline-none"
            >
              <option value="home">Home (Kenilworth Road)</option>
              <option value="away">Away Ground</option>
              <option value="neutral">Neutral Venue</option>
              <option value="watching-elsewhere">Watching Elsewhere</option>
            </select>
          </div>

          {/* Fan Type */}
          <div class="flex flex-col gap-1">
            <label
              for="fanType"
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Your Fan Story *
            </label>
            <select
              id="fanType"
              aria-label="Fan Type"
              value={formState.fanType}
              onChange={(e) =>
                updateField(
                  "fanType",
                  (e.target as HTMLSelectElement).value as IntakeFanType,
                )
              }
              class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                    rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm
                    focus:border-orange-500 dark:focus:border-orange-400 outline-none"
            >
              <option value="loyal-hatter">Loyal Hatter</option>
              <option value="heritage-fan">Heritage Fan</option>
              <option value="returning-fan">Returning Fan</option>
              <option value="international-supporter">
                International Supporter
              </option>
              <option value="family-tradition">Family Tradition</option>
              <option value="first-time">First Time</option>
              <option value="corporate-hospitality">
                Corporate Hospitality
              </option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Group Type + Size — side by side on sm+ */}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1">
              <label
                for="groupType"
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Group Type *
              </label>
              <select
                id="groupType"
                aria-label="Group Type"
                value={formState.groupType}
                onChange={(e) =>
                  updateField(
                    "groupType",
                    (e.target as HTMLSelectElement).value as GroupType,
                  )
                }
                class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                      rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm
                      focus:border-orange-500 dark:focus:border-orange-400 outline-none"
              >
                <option value="solo">Solo</option>
                <option value="couple">Couple</option>
                <option value="solo-senior">Solo (Senior/65+)</option>
                <option value="couple-senior">Couple (Both Senior/65+)</option>
                <option value="family-with-kids">Family with Kids</option>
                <option value="family-mixed-ages">Family (Mixed Ages)</option>
                <option value="group-of-friends">Group of Friends</option>
                <option value="group-mixed-ages">Group (Mixed Ages)</option>
                <option value="corporate">Corporate</option>
                <option value="community-group">Community Group</option>
                <option value="school-group">School Group</option>
              </select>
            </div>

            <div class="flex flex-col gap-1">
              <label
                for="groupSize"
                class="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Group Size *
              </label>
              <input
                id="groupSize"
                type="number"
                min={1}
                max={50}
                value={formState.groupSize}
                onInput={(e) =>
                  updateField(
                    "groupSize",
                    parseInt((e.target as HTMLInputElement).value, 10),
                  )
                }
                class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                       rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm
                       focus:border-orange-500 dark:focus:border-orange-400 outline-none"
              />
              {getFieldError("groupSize") !== undefined && (
                <span class="text-xs text-red-600 dark:text-red-400">
                  {getFieldError("groupSize")}
                </span>
              )}
            </div>
          </div>

          {/* Budget */}
          <div class="flex flex-col gap-1">
            <label
              for="budgetPerPerson"
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Budget Per Person (£) *
            </label>
            <input
              id="budgetPerPerson"
              type="number"
              min={0}
              value={formState.budgetPerPerson}
              onInput={(e) =>
                updateField(
                  "budgetPerPerson",
                  parseFloat((e.target as HTMLInputElement).value),
                )
              }
              class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                    rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm
                    focus:border-orange-500 dark:focus:border-orange-400 outline-none"
            />
            {getFieldError("budgetPerPerson") !== undefined && (
              <span class="text-xs text-red-600 dark:text-red-400">
                {getFieldError("budgetPerPerson")}
              </span>
            )}
          </div>

          {/* Travel Mode */}
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Travel Mode *{" "}
              <span class="text-xs text-gray-500 dark:text-gray-400">
                (Select all that apply)
              </span>
            </label>
            <div class="flex flex-wrap gap-2">
              {TRANSPORT_OPTIONS.map(({ value, emoji, label }) => {
                const checked = formState.travelModes.includes(
                  value as TravelModeNew,
                );
                return (
                  <label
                    key={value}
                    class={`flex items-center gap-1.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors select-none text-sm font-medium ${
                      checked
                        ? "border-orange-500 bg-orange-950/30 text-white dark:bg-orange-950/50"
                        : "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      value={value}
                      checked={checked}
                      onChange={() => toggleTravelMode(value as TravelModeNew)}
                      class="sr-only"
                    />
                    <span aria-hidden="true">{emoji}</span>
                    {label}
                  </label>
                );
              })}
            </div>
            {getFieldError("travelModes") !== undefined && (
              <span class="text-xs text-red-600 dark:text-red-400">
                {getFieldError("travelModes")}
              </span>
            )}
          </div>

          {/* Preferences — 2 column grid */}
          <div class="flex flex-col gap-4">
            <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
              Match Day Preferences
            </label>
            <div class="grid grid-cols-2 gap-3">
              <label
                class="flex items-center gap-3 
                            cursor-pointer text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={formState.prefersPubPreMatch}
                  onChange={(e) =>
                    updateField(
                      "prefersPubPreMatch",
                      (e.target as HTMLInputElement).checked,
                    )
                  }
                  class="w-4 h-4 accent-orange-500"
                />
                Pre-match pub
              </label>
              <label
                class="flex items-center gap-3 
                            cursor-pointer text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={formState.prefersFood}
                  onChange={(e) =>
                    updateField(
                      "prefersFood",
                      (e.target as HTMLInputElement).checked,
                    )
                  }
                  class="w-4 h-4 accent-orange-500"
                />
                Food recommendations
              </label>
              <label
                class="flex items-center gap-3 
                            cursor-pointer text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={formState.prefersShoppingAreas}
                  onChange={(e) =>
                    updateField(
                      "prefersShoppingAreas",
                      (e.target as HTMLInputElement).checked,
                    )
                  }
                  class="w-4 h-4 accent-orange-500"
                />
                Shopping areas
              </label>
              <label
                class="flex items-center gap-3 
                            cursor-pointer text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={formState.prefersAttractionSites}
                  onChange={(e) =>
                    updateField(
                      "prefersAttractionSites",
                      (e.target as HTMLInputElement).checked,
                    )
                  }
                  class="w-4 h-4 accent-orange-500"
                />
                Attraction sites
              </label>
              <label
                class="flex items-center gap-3 
                            cursor-pointer text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={formState.prefersLocationHistory}
                  onChange={(e) =>
                    updateField(
                      "prefersLocationHistory",
                      (e.target as HTMLInputElement).checked,
                    )
                  }
                  class="w-4 h-4 accent-orange-500"
                />
                Heritage & Storytelling
              </label>
              <label
                class="flex items-center gap-3 
                            cursor-pointer text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={formState.prefersParkingRecommendations}
                  onChange={(e) =>
                    updateField(
                      "prefersParkingRecommendations",
                      (e.target as HTMLInputElement).checked,
                    )
                  }
                  class="w-4 h-4 accent-orange-500"
                />
                Vehicle parking
              </label>
            </div>
          </div>

          {/* Accessibility Needs */}
          <div class="flex flex-col gap-1">
            <label
              for="accessibilityNeeds"
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Accessibility Needs
            </label>
            <textarea
              id="accessibilityNeeds"
              value={formState.accessibilityNeeds}
              placeholder="Leave blank if none"
              onInput={(e) =>
                updateField(
                  "accessibilityNeeds",
                  (e.target as HTMLTextAreaElement).value,
                )
              }
              rows={2}
              class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm
                     focus:border-orange-500 dark:focus:border-orange-400 outline-none 
                     resize-none"
            />
          </div>

          {/* Additional Notes */}
          <div class="flex flex-col gap-1">
            <label
              for="additionalNotes"
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Additional Notes
            </label>
            <textarea
              id="additionalNotes"
              value={formState.additionalNotes}
              placeholder="Anything else we should know?"
              onInput={(e) =>
                updateField(
                  "additionalNotes",
                  (e.target as HTMLTextAreaElement).value,
                )
              }
              rows={3}
              class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                     rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm
                     focus:border-orange-500 dark:focus:border-orange-400 outline-none 
                     resize-none"
            />
          </div>

          {/* Global validation error summary */}
          {validationErrors.length > 0 && (
            <div
              class="bg-red-100 dark:bg-red-950 border border-red-400 dark:border-red-500/30 
                        rounded-lg p-3"
            >
              <p class="text-xs text-red-700 dark:text-red-400 font-medium mb-1">
                Please fix the following:
              </p>
              <ul class="list-disc list-inside">
                {validationErrors.map((error) => (
                  <li
                    key={error.field}
                    class="text-xs text-red-600 dark:text-red-300"
                  >
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isIntakeSubmitting.value}
            class={[
              "w-full py-3 px-6 rounded-xl font-semibold",
              "text-sm transition-all duration-200",
              isIntakeSubmitting.value
                ? "bg-gray-400 dark:bg-gray-700 text-gray-600 dark:text-gray-500 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-400 text-white",
            ].join(" ")}
          >
            {isIntakeSubmitting.value
              ? "Planning your match day..."
              : "Plan My Match Day 🧡"}
          </button>
        </div>
      </div>
    </div>
  );
};
