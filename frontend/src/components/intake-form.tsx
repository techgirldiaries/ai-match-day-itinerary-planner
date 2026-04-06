import { AlertCircle } from "lucide-react";
import { useState } from "preact/hooks";
import { t } from "@/i18n";
import { formatIntakeMessage } from "@/components/utils/formatIntakeMessage";
import { validateIntakeForm } from "@/components/utils/validateIntakeForm";
import {
  toggleArrayItem,
  sanitizeInput,
  isValidCity,
  FORM_CONSTRAINTS,
} from "@/utils/formUtils";
import {
  agent,
  connectionError,
  currentPage,
  isAgentThinking,
  messages,
  preferredLanguage,
  task,
  workforce,
} from "@/core/signals";
import type {
  FanType,
  IntakeFormData,
  InterestType,
  MatchType,
  TransportMode,
  TravelStyle,
  Message,
} from "@/core/types";
import {
  TRANSPORT_OPTIONS,
  INTEREST_OPTIONS,
  TRAVEL_STYLE_OPTIONS,
  FAN_TYPE_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  CSS_CLASSES,
} from "@/config/formConfig";
import {
  buildFieldClass,
  buildTransportOptionClass,
  buildChipClass,
  buildSwitchClass,
  buildSwitchThumbClass,
} from "@/utils/formThemes";

export function IntakeForm() {
  const [originCity, setOriginCity] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [matchType, setMatchType] = useState<MatchType>("home");
  const [groupSize, setGroupSize] = useState(1);
  const [budgetGbp, setBudgetGbp] = useState(100);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("standard");
  const [fanType, setFanType] = useState<FanType>("loyal_hatter");
  const [interests, setInterests] = useState<InterestType[]>(["pubs", "food"]);
  const [overnightStay, setOvernightStay] = useState(false);
  const [transportModes, setTransportModes] = useState<TransportMode[]>([
    "train",
    "coach",
    "car",
    "bus",
    "taxi",
    "cycling",
    "walking",
    "fly",
  ]);
  const [groupCoordination, setGroupCoordination] = useState(false);
  const [loyaltyMember, setLoyaltyMember] = useState(false);
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);
  const [communityOptIn, setCommunityOptIn] = useState(false);
  const [preferences, setPreferences] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  function toggleTransportMode(mode: TransportMode) {
    setTransportModes((prev) => toggleArrayItem(mode, prev));
  }

  function toggleInterest(interest: InterestType) {
    setInterests((prev) => toggleArrayItem(interest, prev));
  }

  function toggleAccessibilityNeed(value: string) {
    setAccessibilityNeeds((prev) => {
      // If clicking "prefer_not_to_say", clear all others
      if (value === "prefer_not_to_say") {
        return prev.includes(value) ? [] : ["prefer_not_to_say"];
      }

      // If "prefer_not_to_say" is selected, remove it when selecting any other option
      let next = prev.includes("prefer_not_to_say")
        ? prev.filter((v) => v !== "prefer_not_to_say")
        : prev;

      // Toggle the selected option
      if (next.includes(value)) {
        next = next.filter((v) => v !== value);
      } else {
        next = [...next, value];
      }

      return next;
    });
  }

  function validate(): boolean {
    const data: IntakeFormData = {
      origin_city: sanitizeInput(originCity),
      match_date: matchDate,
      match_time: matchTime,
      match_type: matchType,
      group_size: groupSize,
      budget_gbp: budgetGbp,
      overnight_stay: overnightStay,
      transport_modes: transportModes,
      travel_style: travelStyle,
      fan_type: fanType,
      interests,
      group_coordination: groupCoordination,
      loyalty_member: loyaltyMember,
      accessibility_needs: accessibilityNeeds,
      community_opt_in: communityOptIn,
      preferences: sanitizeInput(preferences),
    };
    const errs = validateIntakeForm(data);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    // Check if agent/workforce is available
    if (!workforce.value && !agent.value) {
      setFormError(
        "Unable to connect to the AI agent. Please check your connection and refresh the page.",
      );
      console.error("Submit failed: No agent or workforce available");
      return;
    }

    const data: IntakeFormData = {
      origin_city: sanitizeInput(originCity),
      match_date: matchDate,
      match_time: matchTime,
      match_type: matchType,
      group_size: groupSize,
      budget_gbp: budgetGbp,
      overnight_stay: overnightStay,
      transport_modes: transportModes,
      travel_style: travelStyle,
      fan_type: fanType,
      interests,
      group_coordination: groupCoordination,
      loyalty_member: loyaltyMember,
      accessibility_needs: accessibilityNeeds,
      community_opt_in: communityOptIn,
      preferences: sanitizeInput(preferences),
    };

    const message = formatIntakeMessage(data);
    setIsSubmitting(true);
    setFormError(""); // Clear any previous errors

    // Navigate to chat page before submitting
    currentPage.value = "chat";

    // Generate message ID once and store it for potential removal on error
    const messageId = crypto.randomUUID();
    messages.value = [
      ...messages.value,
      {
        id: messageId,
        role: "user",
        content: message,
        timestamp: Date.now(),
      } as Message,
    ];

    // Show thinking bubble while waiting for response
    isAgentThinking.value = true;

    try {
      const resultTask = workforce.value
        ? task.value
          ? await workforce.value.sendMessage(message, task.value)
          : await workforce.value.sendMessage(message)
        : task.value
          ? await agent.value?.sendMessage(message, task.value)
          : await agent.value?.sendMessage(message);
      if (task.value !== resultTask) {
        task.value = resultTask;
      }
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again.",
      );
      console.error("Error sending message:", error);
      // Remove the optimistic message if sending failed
      messages.value = messages.value.filter((m) => m.id !== messageId);
    } finally {
      setIsSubmitting(false);
      isAgentThinking.value = false;
    }
  }

  return (
    <div class="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
      {/* Hero */}
      <div class="text-center mb-4 sm:mb-6 md:mb-8">
        <div
          class="inline-flex items-center justify-center w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 rounded-full bg-orange-500 mb-2 sm:mb-3 md:mb-4 text-lg sm:text-xl md:text-2xl"
          aria-hidden="true"
        >
          🏟️
        </div>
        <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {t("planYourItinerary")}
        </h2>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {t("formSubtitle")}
        </p>
      </div>

      {/* Error alert */}
      {formError && (
        <div
          class="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
          role="alert"
        >
          <div class="flex items-start gap-2">
            <AlertCircle
              size={18}
              class="shrink-0 text-red-600 dark:text-red-400 mt-0.5"
              aria-hidden="true"
            />
            <p class="text-sm text-red-700 dark:text-red-300">{formError}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-label={t("planYourItinerary")}
        class="w-full box-border"
      >
        {/* ── Trip details ── */}
        <fieldset class={CSS_CLASSES.formCard}>
          <legend class={CSS_CLASSES.formLegend}>{t("tripDetails")}</legend>

          <div class="mb-4">
            <label for="origin_city" class={CSS_CLASSES.formLabel}>
              {t("whereFrom")}{" "}
              <span class="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <input
              id="origin_city"
              type="text"
              value={originCity}
              onInput={(e) =>
                setOriginCity((e.target as HTMLInputElement).value)
              }
              placeholder="Enter your city"
              pattern="[a-zA-Z\s\-']+"
              maxlength={FORM_CONSTRAINTS.cityMaxLength}
              autocomplete="address-level2"
              aria-required="true"
              aria-describedby={
                errors.origin_city ? "origin_city_error" : undefined
              }
              class={`${buildFieldClass(Boolean(errors.origin_city))} placeholder-gray-500`}
            />
            {errors.origin_city && (
              <p
                id="origin_city_error"
                role="alert"
                class={CSS_CLASSES.errorText}
              >
                <AlertCircle size={14} aria-hidden="true" />
                {errors.origin_city}
              </p>
            )}
          </div>

          {/* Match type */}
          <div class="mb-4">
            <p class={CSS_CLASSES.formLabel}>{t("matchType")}</p>
            <div class="flex flex-wrap gap-2">
              {(["home", "away"] as MatchType[]).map((type) => {
                const checked = matchType === type;
                return (
                  <label key={type} class={buildChipClass(checked)}>
                    <input
                      type="radio"
                      name="match_type"
                      value={type}
                      checked={checked}
                      onChange={() => setMatchType(type)}
                      class="sr-only"
                    />
                    <span aria-hidden="true">
                      {type === "home" ? "🏟️" : "🚌"}
                    </span>
                    {type === "home" ? t("home") : t("away")}
                  </label>
                );
              })}
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label for="match_date" class={CSS_CLASSES.formLabel}>
                {t("matchDate")}{" "}
                <span class="text-red-500" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="match_date"
                type="date"
                lang="en-GB"
                value={matchDate}
                onInput={(e) =>
                  setMatchDate((e.target as HTMLInputElement).value)
                }
                aria-describedby={
                  errors.match_date ? "match_date_error" : undefined
                }
                class={buildFieldClass(Boolean(errors.match_date))}
              />
              {errors.match_date && (
                <p
                  id="match_date_error"
                  role="alert"
                  class={CSS_CLASSES.errorText}
                >
                  <AlertCircle size={14} aria-hidden="true" />
                  {errors.match_date}
                </p>
              )}
            </div>

            <div>
              <label for="match_time" class={CSS_CLASSES.formLabel}>
                {t("matchTime")}{" "}
                <span class="text-red-500" aria-hidden="true">
                  *
                </span>
              </label>
              <input
                id="match_time"
                type="time"
                value={matchTime}
                onInput={(e) =>
                  setMatchTime((e.target as HTMLInputElement).value)
                }
                aria-describedby={
                  errors.match_time ? "match_time_error" : undefined
                }
                class={buildFieldClass(Boolean(errors.match_time))}
              />
              {errors.match_time && (
                <p
                  id="match_time_error"
                  role="alert"
                  class={CSS_CLASSES.errorText}
                >
                  <AlertCircle size={14} aria-hidden="true" />
                  {errors.match_time}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        {/* ── Group & budget ── */}
        <fieldset class={CSS_CLASSES.formCard}>
          <legend class={CSS_CLASSES.formLegend}>{t("groupBudget")}</legend>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div>
              <label for="group_size" class={CSS_CLASSES.formLabel}>
                {t("groupSize")}
              </label>
              <input
                id="group_size"
                type="number"
                value={groupSize}
                min={FORM_CONSTRAINTS.groupSize.min}
                max={FORM_CONSTRAINTS.groupSize.max}
                onInput={(e) =>
                  setGroupSize(
                    Math.max(
                      FORM_CONSTRAINTS.groupSize.min,
                      Number((e.target as HTMLInputElement).value),
                    ),
                  )
                }
                aria-describedby="group_size_hint"
                class={`${CSS_CLASSES.inputBase} ${CSS_CLASSES.inputBorder}`}
              />
              <p id="group_size_hint" class={CSS_CLASSES.helpText}>
                {t("groupSizeHint")}
              </p>
            </div>

            <div>
              <label for="budget_gbp" class={CSS_CLASSES.formLabel}>
                {t("budgetPerPerson")}
              </label>
              <div class="relative">
                <span
                  class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium"
                  aria-hidden="true"
                >
                  £
                </span>
                <input
                  id="budget_gbp"
                  type="number"
                  value={budgetGbp}
                  min={FORM_CONSTRAINTS.budget.min}
                  max={FORM_CONSTRAINTS.budget.max}
                  step={FORM_CONSTRAINTS.budget.step}
                  onInput={(e) =>
                    setBudgetGbp(
                      Math.max(
                        FORM_CONSTRAINTS.budget.min,
                        Number((e.target as HTMLInputElement).value),
                      ),
                    )
                  }
                  aria-label="Budget in pounds per person"
                  class={`${CSS_CLASSES.inputBase} ${CSS_CLASSES.inputBorder} pl-8 pr-4`}
                />
              </div>
            </div>
          </div>

          {/* Travel style */}
          <div>
            <p class={CSS_CLASSES.formLabel}>{t("travelStyle")}</p>
            <div class="flex flex-wrap gap-2">
              {TRAVEL_STYLE_OPTIONS.map(({ value, label, emoji }) => {
                const checked = travelStyle === value;
                return (
                  <label key={value} class={buildChipClass(checked)}>
                    <input
                      type="radio"
                      name="travel_style"
                      value={value}
                      checked={checked}
                      onChange={() => setTravelStyle(value)}
                      class="sr-only"
                    />
                    <span aria-hidden="true">{emoji}</span>
                    {label}
                  </label>
                );
              })}
            </div>
          </div>
        </fieldset>

        {/* ── Fan profile ── */}
        <fieldset class={CSS_CLASSES.formCard}>
          <legend class={CSS_CLASSES.formLegend}>Fan Profile</legend>

          {/* Fan type */}
          <div class="mb-4">
            <label for="fan_type" class={CSS_CLASSES.formLabel}>
              {t("fanType")}
            </label>
            <select
              id="fan_type"
              value={fanType}
              onChange={(e) =>
                setFanType((e.target as HTMLSelectElement).value as FanType)
              }
              class={`${CSS_CLASSES.inputBase} ${CSS_CLASSES.inputBorder}`}
            >
              {FAN_TYPE_OPTIONS.map(({ value, transKey }) => (
                <option key={value} value={value}>
                  {t(transKey)}
                </option>
              ))}
            </select>
          </div>

          {/* Interests */}
          <div>
            <fieldset class="border-0 p-0 m-0">
              <legend class="text-sm font-medium text-gray-300 mb-2">
                {t("interests")}{" "}
                <span class="text-xs font-normal text-gray-400">
                  {t("selectAll")}
                </span>
              </legend>
              <div class="flex flex-wrap gap-2 pb-2">
                {INTEREST_OPTIONS.map(({ value, emoji, transKey }) => {
                  const checked = interests.includes(value);
                  return (
                    <label key={value} class={buildChipClass(checked)}>
                      <input
                        type="checkbox"
                        value={value}
                        checked={checked}
                        onChange={() => toggleInterest(value)}
                        class="sr-only"
                      />
                      <span aria-hidden="true">{emoji}</span>
                      {t(transKey)}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </fieldset>

        {/* ── Options ── */}
        <fieldset class={CSS_CLASSES.formCard}>
          <legend class={CSS_CLASSES.formLegend}>{t("options")}</legend>

          {/* Transport modes */}
          <div class="mb-5">
            <fieldset class="border-0 p-0 m-0">
              <legend class="text-sm font-medium text-gray-300 mb-2">
                {t("transportModes")}{" "}
                <span class="text-xs font-normal text-gray-400">
                  {t("selectAll")}
                </span>
              </legend>
              <div class="flex flex-wrap gap-2 pb-2">
                {TRANSPORT_OPTIONS.map(({ value, emoji, label }) => {
                  const checked = transportModes.includes(value);
                  return (
                    <label
                      key={value}
                      class={buildTransportOptionClass(checked)}
                    >
                      <input
                        type="checkbox"
                        value={value}
                        checked={checked}
                        onChange={() => toggleTransportMode(value)}
                        class="sr-only"
                      />
                      <span aria-hidden="true">{emoji}</span>
                      {label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
            {errors.transport_modes && (
              <p role="alert" class={CSS_CLASSES.errorText}>
                <AlertCircle size={14} aria-hidden="true" />
                {errors.transport_modes}
              </p>
            )}
          </div>

          {/* Overnight Stay */}
          <div class="flex items-start justify-between gap-4 py-4 mb-4">
            <div>
              <p
                id="overnight_label"
                class="text-sm font-semibold text-gray-300"
              >
                {t("overnightStay")}
              </p>
              <p id="overnight_hint" class="text-xs text-gray-400 mt-0.5">
                {t("overnightHint")}
              </p>
            </div>
            <button
              type="button"
              aria-labelledby="overnight_label"
              aria-describedby="overnight_hint"
              onClick={() => setOvernightStay((v) => !v)}
              class={buildSwitchClass(overnightStay)}
            >
              <span
                aria-hidden="true"
                class={buildSwitchThumbClass(overnightStay)}
              />
            </button>
          </div>

          {/* Community opt-in */}
          <div class="flex items-start justify-between gap-4 py-4">
            <div>
              <p
                id="community_label"
                class="text-sm font-semibold text-gray-300"
              >
                {t("communityTips")}
              </p>
              <p id="community_hint" class="text-xs text-gray-400 mt-0.5">
                {t("communityHint")}
              </p>
            </div>
            <button
              type="button"
              aria-labelledby="community_label"
              aria-describedby="community_hint"
              onClick={() => setCommunityOptIn((v) => !v)}
              class={buildSwitchClass(communityOptIn)}
            >
              <span
                aria-hidden="true"
                class={buildSwitchThumbClass(communityOptIn)}
              />
            </button>
          </div>
        </fieldset>

        {/* ── Advanced options ── */}
        <fieldset class={CSS_CLASSES.formCard}>
          <legend class={CSS_CLASSES.formLegend}>{t("advancedOptions")}</legend>

          {/* Group coordination */}
          <div class="flex items-start justify-between gap-4 py-4 mb-4">
            <div>
              <p
                id="group_coord_label"
                class="text-sm font-semibold text-gray-300"
              >
                {t("groupCoordination")}
              </p>
              <p id="group_coord_hint" class="text-xs text-gray-400 mt-0.5">
                {t("groupCoordinationDescription")}
              </p>
            </div>
            <button
              type="button"
              aria-labelledby="group_coord_label"
              aria-describedby="group_coord_hint"
              onClick={() => setGroupCoordination((v) => !v)}
              class={buildSwitchClass(groupCoordination)}
            >
              <span
                aria-hidden="true"
                class={buildSwitchThumbClass(groupCoordination)}
              />
            </button>
          </div>

          {/* Loyalty member */}
          <div class="flex items-start justify-between gap-4 py-4 mb-4">
            <div>
              <p id="loyalty_label" class="text-sm font-semibold text-gray-300">
                {t("loyaltyMember")}
              </p>
              <p id="loyalty_hint" class="text-xs text-gray-400 mt-0.5">
                {t("loyaltyMemberDescription")}
              </p>
            </div>
            <button
              type="button"
              aria-labelledby="loyalty_label"
              aria-describedby="loyalty_hint"
              onClick={() => setLoyaltyMember((v) => !v)}
              class={buildSwitchClass(loyaltyMember)}
            >
              <span
                aria-hidden="true"
                class={buildSwitchThumbClass(loyaltyMember)}
              />
            </button>
          </div>

          {/* Accessibility needs */}
          <div class="mb-5">
            <fieldset class="border-0 p-0 m-0">
              <legend class="text-sm font-medium text-gray-300 mb-2">
                {t("accessibilityNeeds")}{" "}
                <span class="text-xs font-normal text-gray-400">
                  {t("preferencesOptional")}
                </span>
              </legend>
              <div class="flex flex-wrap gap-2 pb-2">
                {ACCESSIBILITY_OPTIONS.map(({ value, emoji, transKey }) => {
                  const checked = accessibilityNeeds.includes(value);
                  return (
                    <label key={value} class={buildChipClass(checked)}>
                      <input
                        type="checkbox"
                        value={value}
                        checked={checked}
                        onChange={() => toggleAccessibilityNeed(value)}
                        class="sr-only"
                      />
                      <span aria-hidden="true">{emoji}</span>
                      {t(transKey)}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </fieldset>

        {/* ── Preferences ── */}
        <fieldset class="w-full box-border mb-6 border border-gray-700 rounded-2xl p-5">
          <legend class="sr-only">{t("preferences")}</legend>
          <label for="preferences" class={CSS_CLASSES.formLabel}>
            {t("preferences")}{" "}
            <span class="text-xs font-normal text-gray-400">
              {t("preferencesOptional")}
            </span>
          </label>
          <textarea
            id="preferences"
            value={preferences}
            onInput={(e) =>
              setPreferences((e.target as HTMLTextAreaElement).value)
            }
            placeholder={t("preferencesPlaceholder")}
            rows={3}
            maxlength={FORM_CONSTRAINTS.preferencesMaxLength}
            aria-describedby="preferences_hint"
            class={`${CSS_CLASSES.inputBase} ${CSS_CLASSES.inputBorder} placeholder-gray-500 resize-none`}
          />
          <p id="preferences_hint" class={CSS_CLASSES.helpText}>
            {t("preferencesHint")}
          </p>
        </fieldset>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={isSubmitting}
          class={CSS_CLASSES.submitButton}
        >
          {isSubmitting ? (
            <>
              <span class={CSS_CLASSES.spinner} aria-hidden="true" />
              <span>{t("planningTrip")}</span>
            </>
          ) : (
            t("planButton")
          )}
        </button>
      </form>
    </div>
  );
}
