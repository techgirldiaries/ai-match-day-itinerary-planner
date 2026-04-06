import { AlertTriangle } from "lucide-preact";
import type { JSX } from "preact";
import { useEffect } from "preact/hooks";
import { Avatar } from "@/components/common";
import { CSS_CLASSES } from "@/config/formConfig";
import {
  agent,
  agentAvatar,
  agentInitials,
  agentName,
  type ChatMessage,
  currentItinerary,
  isAgentTyping,
  messages,
  task,
  workforce,
} from "@/core/signals";
import type { ItineraryResponse } from "@/core/types/types";
import { TimeAgo } from "@/utils/helpers";

type ParsedResponse =
  | { type: "itinerary"; data: ItineraryResponse }
  | { type: "failed"; error?: string }
  | { type: "text" };

type WeatherForecast = {
  temperature?: string;
  conditions?: string;
  precipitation?: string;
  clothing_recommendation?: string;
  travel_impact?: string;
  stadium_info?: string;
  live_disruption_alerts?: string;
};

function getRouteDescription(option: unknown): string | undefined {
  if (!option || typeof option !== "object") {
    return undefined;
  }

  const candidate = option as {
    route_description?: unknown;
    route?: unknown;
    description?: unknown;
  };

  if (typeof candidate.route_description === "string") {
    return candidate.route_description;
  }

  if (typeof candidate.route === "string") {
    return candidate.route;
  }

  if (typeof candidate.description === "string") {
    return candidate.description;
  }

  return undefined;
}

function getJourneyTime(option: unknown): string | undefined {
  if (!option || typeof option !== "object") {
    return undefined;
  }

  const candidate = option as {
    journey_time?: unknown;
    travel_time?: unknown;
    duration?: unknown;
  };

  if (typeof candidate.journey_time === "string") {
    return candidate.journey_time;
  }

  if (typeof candidate.travel_time === "string") {
    return candidate.travel_time;
  }

  if (typeof candidate.duration === "string") {
    return candidate.duration;
  }

  return undefined;
}

function itineraryToReadableText(data: ItineraryResponse): string {
  const sections: string[] = [];

  const s = data.match_summary;

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN TITLE
  sections.push("# LTFC MATCH DAY GUIDE\n");

  // Opening paragraph with match basics
  if (s) {
    const competition = s.competition ? ` (${s.competition})` : "";
    sections.push(
      `**${s.opponent} vs Luton Town FC**${competition} | ${s.kick_off} kick-off | ${s.venue || "Kenilworth Stadium Road"}\n`,
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BASIC HEADING
  sections.push("### The Basics\n");

  // Write basics as flowing paragraph, integrating weather
  const weather = (
    data as ItineraryResponse & { weather_forecast?: WeatherForecast }
  ).weather_forecast;

  if (
    weather ||
    (data.transport_recommendation?.best_value &&
      typeof data.transport_recommendation.best_value === "object")
  ) {
    let basicsText =
      "You're heading to a home match at the Kenny on a Saturday afternoon.";

    if (weather?.conditions) {
      basicsText += ` April weather in the Midlands is a toss-up — could be ${weather.conditions.toLowerCase()}`;
      if (weather.temperature) {
        basicsText += `, expect ${weather.temperature.toLowerCase()}`;
      }
      basicsText += ".";
    }

    if (weather?.clothing_recommendation) {
      basicsText += ` Wear your orange and white, and bring ${weather.clothing_recommendation.toLowerCase()}.`;
    }

    sections.push(basicsText + "\n");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TRAVEL OPTIONS - Natural prose
  if (data.transport_recommendation) {
    sections.push("### Getting There\n");
    const t = data.transport_recommendation;
    const bestOption = t.best_value;

    if (bestOption && typeof bestOption === "object") {
      const typedOption = bestOption as {
        route_description?: string;
        route?: string;
        description?: string;
        cost?: string;
        journey_time?: string;
        travel_time?: string;
        duration?: string;
        payment_methods?: string;
        booking_info?: string;
      };

      const routeDesc =
        getRouteDescription(bestOption) || "local transport from your area";
      const cost = typedOption.cost || "a few pounds";
      const time = getJourneyTime(bestOption) || "20-30 minutes";
      const payment = typedOption.payment_methods || "contactless/card";

      const travelText = `Your best bet is ${routeDesc}. It'll run you ${cost} return and takes about ${time}. Just pay on board or use contactless — most operators take it. Allow a bit of extra time if there's a crowd — match days draw solid turnout.\n`;
      sections.push(travelText);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCOMMODATION (minimal if included)
  if (data.accommodation?.length) {
    sections.push("### Accommodation\n");
    data.accommodation.forEach((hotel: (typeof data.accommodation)[number]) => {
      let text = `**${hotel.name}** — £${hotel.price_per_night} per night`;
      if (hotel.distance_from_stadium) {
        text += ` (${hotel.distance_from_stadium} from stadium)`;
      }
      sections.push(text);
    });
    sections.push("");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOD & DRINK - Brief notes only
  if (data.food_and_drink?.length) {
    sections.push("### Food & Drink\n");
    data.food_and_drink.forEach(
      (place: (typeof data.food_and_drink)[number]) => {
        let text = `**${place.name}**`;
        if (place.distance_from_stadium) {
          text += ` — ${place.distance_from_stadium} from stadium`;
        }
        if (place.description) {
          text += `. ${place.description}`;
        }
        sections.push(text);
      },
    );
    sections.push("");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MATCH DAY TIMELINE
  if (data.timeline?.length) {
    sections.push("### Timeline\n");

    data.timeline.forEach((item: (typeof data.timeline)[number]) => {
      const locationPart = item.location ? ` @ ${item.location}` : "";
      sections.push(`**${item.time}** – ${item.activity}`);
    });

    sections.push("");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COST BREAKDOWN - Keep simple
  if (data.cost_breakdown?.total != null) {
    sections.push("### What It Costs\n");

    const c = data.cost_breakdown;
    const currency = c.currency ?? "£";

    sections.push(`**${currency}${c.total}** per person for the day.\n`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TOP TIPS
  if (data.top_tips?.length) {
    sections.push("### A Few Practical Things\n");

    data.top_tips.forEach((tip: string) => {
      sections.push(`**▪** ${tip}`);
    });
    sections.push("");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // WRAP-UP
  sections.push("### That's It\n");
  sections.push(
    "It's a proper home-match routine: get in early, soak in the familiar rhythm of the ground filling up, and be ready for the noise. At the Kenny, you're never really on your own.\n",
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SIGN-OFF
  sections.push("Come on you Hatters.");

  return sections.join("\n").trim();
}

function StructuredTextDocument({ text }: { text: string }): JSX.Element {
  const blocks = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return <p class="doc-paragraph">{renderMarkdown(text)}</p>;
  }

  return (
    <article class="doc-output" aria-label="Assistant response document">
      {blocks.map((block, index) => {
        // Detect heading levels (# ## ### etc.)
        const headingMatch = block.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
          const content = headingMatch[2].trim();
          const headingClass = `doc-h${level}`;
          const renderedContent = renderMarkdown(content);

          return renderHeading(level, renderedContent, headingClass, index);
        }

        // Detect unordered list items (- or *)
        if (/^[-*]\s+/.test(block)) {
          // Split by lines that start with - or *
          const items = block
            .split("\n")
            .filter((line) => line.trim())
            .reduce((acc, line) => {
              // Check if line starts a new list item
              if (/^[-*]\s+/.test(line)) {
                acc.push(line.replace(/^[-*]\s+/, "").trim());
              } else if (acc.length > 0) {
                // Append continuation to previous item
                acc[acc.length - 1] += " " + line.trim();
              }
              return acc;
            }, [] as string[]);

          return (
            <ul key={`list-${index}`} class="doc-list doc-list-unordered">
              {items.map((item, i) => (
                <li key={`item-${i}`}>{renderMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        // Detect ordered list items (1. 2. 3. etc.)
        if (/^\d+\.\s+/.test(block)) {
          const items = block
            .split("\n")
            .filter((line) => line.trim())
            .reduce((acc, line) => {
              // Check if line starts a new list item
              if (/^\d+\.\s+/.test(line)) {
                acc.push(line.replace(/^\d+\.\s+/, "").trim());
              } else if (acc.length > 0) {
                // Append continuation to previous item
                acc[acc.length - 1] += " " + line.trim();
              }
              return acc;
            }, [] as string[]);

          return (
            <ol key={`list-${index}`} class="doc-list doc-list-ordered">
              {items.map((item, i) => (
                <li key={`item-${i}`}>{renderMarkdown(item)}</li>
              ))}
            </ol>
          );
        }

        // Detect blockquotes (> at start)
        if (/^>\s+/.test(block)) {
          const content = block.replace(/^>\s+/, "").trim();
          return (
            <blockquote key={`quote-${index}`} class="doc-blockquote">
              {renderMarkdown(content)}
            </blockquote>
          );
        }

        // Default to paragraph
        return (
          <p key={`paragraph-${index}`} class="doc-paragraph">
            {renderMarkdown(block)}
          </p>
        );
      })}
    </article>
  );
}

function renderHeading(
  level: 1 | 2 | 3 | 4 | 5 | 6,
  content: string | JSX.Element[] | (string | JSX.Element)[],
  className: string,
  key: string | number,
) {
  switch (level) {
    case 1:
      return (
        <h1 key={key} class={className}>
          {content}
        </h1>
      );
    case 2:
      return (
        <h2 key={key} class={className}>
          {content}
        </h2>
      );
    case 3:
      return (
        <h3 key={key} class={className}>
          {content}
        </h3>
      );
    case 4:
      return (
        <h4 key={key} class={className}>
          {content}
        </h4>
      );
    case 5:
      return (
        <h5 key={key} class={className}>
          {content}
        </h5>
      );
    case 6:
      return (
        <h6 key={key} class={className}>
          {content}
        </h6>
      );
  }
}

function renderMarkdown(text: string): (string | JSX.Element)[] {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;

  // Match bold (**text**), italic (*text* or _text_), and links
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(_(.+?)_)|(\[(.+?)\]\((.+?)\))/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    if (match[2]) {
      // Bold
      parts.push(<strong>{match[2]}</strong>);
    } else if (match[4]) {
      // Italic with *
      parts.push(<em>{match[4]}</em>);
    } else if (match[6]) {
      // Italic with _
      parts.push(<em>{match[6]}</em>);
    } else if (match[8] && match[9]) {
      // Link
      parts.push(
        <a
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          class="text-orange-500 hover:text-orange-600 underline"
        >
          {match[8]}
        </a>,
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length === 0 ? [text] : parts;
}

function parseResponse(text: string): ParsedResponse {
  // First, try to parse as JSON only if it looks like JSON
  if (text.trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object") return { type: "text" };
      if (parsed.status === "failed")
        return { type: "failed", error: parsed.error };
      if (parsed.itinerary && typeof parsed.itinerary === "object")
        return {
          type: "itinerary",
          data: parsed.itinerary as ItineraryResponse,
        };
      if (parsed.match_summary || parsed.timeline || parsed.cost_breakdown)
        return { type: "itinerary", data: parsed as ItineraryResponse };
    } catch {
      // If JSON parsing fails, treat as plain text markdown
    }
  }

  // Default to plain markdown text
  return { type: "text" };
}

function AgentAvatar(): JSX.Element {
  return (
    <Avatar.Root>
      <Avatar.Image
        src={agentAvatar.value}
        class="size-10 rounded-full border border-zinc-200 dark:border-zinc-700"
        alt=""
      />
      <Avatar.Fallback class={CSS_CLASSES.avatarFallback}>
        {agentInitials.value ?? "🏠"}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}

interface AgentMessageProps {
  message: ChatMessage;
}

export function AgentMessage({ message }: AgentMessageProps) {
  const parsed = parseResponse(message.text);

  // Update current itinerary when a new one is parsed
  useEffect(() => {
    if (parsed.type === "itinerary") {
      currentItinerary.value = parsed.data;
    }
  }, [parsed.type, parsed]);

  const confidenceLow =
    parsed.type === "itinerary" && parsed.data.confidence === "low";

  // ── Failed response ───────────────────────────────────────────────────────
  if (parsed.type === "failed") {
    async function handleRetry() {
      const msgs = messages.value;
      const idx = msgs.indexOf(message);
      // Remove the failed agent message
      if (idx !== -1) {
        messages.value = msgs.filter((_: ChatMessage, i: number) => i !== idx);
      }
      // Re-send the most recent user message
      const lastUser = msgs
        .slice(0, idx === -1 ? undefined : idx)
        .reverse()
        .find((m: ChatMessage) => !m.isAgent());
      if (!lastUser || (!workforce.value && !agent.value)) return;
      const t = workforce.value
        ? await workforce.value.sendMessage(lastUser.text)
        : await agent.value?.sendMessage(lastUser.text);
      if (t) {
        task.value = t;
      }
      isAgentTyping.value = false;
    }

    return (
      <div class={CSS_CLASSES.messageRowContainer}>
        <div class="shrink-0" aria-hidden="true">
          <AgentAvatar />
        </div>
        <div class="flex flex-col gap-y-1 items-start">
          <small class="flex gap-x-1.5">
            <span class="text-zinc-700 dark:text-zinc-300">{agentName}</span>
          </small>
          <div class={CSS_CLASSES.failedMessageBubble} role="alert">
            <p class="text-sm text-red-700 dark:text-red-300 mb-2">
              {parsed.error ??
                "Something went wrong planning your itinerary. Please try again."}
            </p>
            <button
              type="button"
              onClick={handleRetry}
              class={CSS_CLASSES.retryButton}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal / itinerary response ───────────────────────────────────────────
  const messageText =
    parsed.type === "itinerary"
      ? itineraryToReadableText(parsed.data)
      : message.text;

  if (!messageText || messageText.trim() === "") {
    return (
      <div class={CSS_CLASSES.messageRowContainer}>
        <div class="shrink-0" aria-hidden="true">
          <AgentAvatar />
        </div>
        <div class="flex flex-col gap-y-1 items-start w-full">
          <small class="flex gap-x-1.5 items-center flex-wrap">
            <span class="text-zinc-700 dark:text-zinc-300">{agentName}</span>
            <span class="text-zinc-500 dark:text-zinc-400">
              <TimeAgo date={message.createdAt} />
            </span>
          </small>
          <div class={CSS_CLASSES.messageBubble} role="alert">
            <p class="text-sm text-zinc-600 dark:text-zinc-400 italic">
              Unable to load response
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div class={CSS_CLASSES.messageRowContainer}>
      <div class="shrink-0" aria-hidden="true">
        <AgentAvatar />
      </div>
      <div class="flex flex-col gap-y-1 items-start w-full">
        <small class="flex gap-x-1.5 items-center flex-wrap">
          <span class="text-zinc-700 dark:text-zinc-300">{agentName}</span>
          <span class="text-zinc-500 dark:text-zinc-400">
            <TimeAgo date={message.createdAt} />
          </span>
          {confidenceLow && (
            <span
              class="confidence-badge"
              role="img"
              aria-label="Some sections have low confidence"
            >
              <AlertTriangle size={10} aria-hidden="true" />
              Low confidence
            </span>
          )}
        </small>
        <div class={CSS_CLASSES.messageBubble}>
          <StructuredTextDocument text={messageText} />
        </div>
      </div>
    </div>
  );
}
