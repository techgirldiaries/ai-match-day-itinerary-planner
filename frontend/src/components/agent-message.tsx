import * as Avatar from "@radix-ui/react-avatar";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "preact/hooks";
import TimeAgo from "react-timeago";
import {
  agent,
  agentAvatar,
  agentInitials,
  agentName,
  type ChatMessage,
  isAgentTyping,
  messages,
  task,
  workforce,
  currentItinerary,
} from "@/core/signals";
import { CSS_CLASSES } from "@/config/formConfig";
import type { ItineraryResponse } from "@/core/types";
import { JSX } from "preact";

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

  // Header
  sections.push("## 🧡 YOUR PERSONALISED LTFC MATCH DAY EXPERIENCE 🤍\n");

  if (data.match_summary) {
    const s = data.match_summary;
    sections.push(`* ${s.opponent} vs Luton Town FC`);

    sections.push("\n## 📅 MATCH DETAILS\n");
    sections.push(`* Date: ${(s as { date?: string }).date || "TBC"}`);
    sections.push(
      `* Day: ${(s as { day_of_week?: string }).day_of_week || "TBC"}`,
    );
    sections.push(`* Kick-off: ${s.kick_off || "TBC"}`);
    sections.push(`* Venue: ${s.venue || "Kenilworth Stadium, Luton"}`);
    if (s.competition) {
      sections.push(`* Competition: ${s.competition}`);
    }
  }

  const weather = (
    data as ItineraryResponse & { weather_forecast?: WeatherForecast }
  ).weather_forecast;

  if (weather) {
    const w = weather;
    sections.push("\n## 🌦️ WEATHER FORECAST\n");
    sections.push("**Match Day Weather:**\n");
    if (w.temperature) {
      sections.push(`* Temperature: ${w.temperature}`);
    }
    if (w.conditions) {
      sections.push(`* Conditions: ${w.conditions}`);
    }
    if (w.precipitation) {
      sections.push(`* Precipitation: ${w.precipitation}`);
    }
    if (w.clothing_recommendation) {
      sections.push(`* What to Wear: ${w.clothing_recommendation}`);
    }
    if (w.travel_impact) {
      sections.push(`* Travel Impact: ${w.travel_impact}`);
    }
    if (w.stadium_info) {
      sections.push(`* Stadium Info: ${w.stadium_info}`);
    }
    if (w.live_disruption_alerts) {
      sections.push(
        `* Live Travel Disruption Alerts: ${w.live_disruption_alerts}`,
      );
    }
  }

  if (data.transport_recommendation) {
    sections.push("\n## 🚂 TRAVEL OPTIONS\n");
    const t = data.transport_recommendation;

    if (t.best_value) {
      const bv = t.best_value;
      sections.push("**💰 Best Value Route**\n");
      const routeDescription = getRouteDescription(bv);
      if (routeDescription) {
        sections.push(`* Route: ${routeDescription}`);
      }
      if (bv.cost) {
        sections.push(`* Cost: ${bv.cost}`);
      }
      const journeyTime = getJourneyTime(bv);
      if (journeyTime) {
        sections.push(`* Journey Time: ${journeyTime}`);
      }
      if ("payment_methods" in bv && typeof bv.payment_methods === "string") {
        sections.push(`* Payment Methods: ${bv.payment_methods}`);
      }
      if ("booking_info" in bv && typeof bv.booking_info === "string") {
        sections.push(`* How to Book: ${bv.booking_info}`);
      }
      sections.push("");
    }

    if (t.fastest) {
      const f = t.fastest;
      sections.push("**⚡ Fastest Route**\n");
      const routeDescription = getRouteDescription(f);
      if (routeDescription) {
        sections.push(`* Route: ${routeDescription}`);
      }
      if (f.cost) {
        sections.push(`* Cost: ${f.cost}`);
      }
      const journeyTime = getJourneyTime(f);
      if (journeyTime) {
        sections.push(`* Journey Time: ${journeyTime}`);
      }
      if ("payment_methods" in f && typeof f.payment_methods === "string") {
        sections.push(`* Payment Methods: ${f.payment_methods}`);
      }
      sections.push("");
    }

    const fewestTransfers = (t as { fewest_transfers?: unknown })
      .fewest_transfers;
    if (fewestTransfers && typeof fewestTransfers === "object") {
      const ft = fewestTransfers as {
        cost?: string;
        payment_methods?: string;
        journey_time?: string;
        travel_time?: string;
        duration?: string;
        route_description?: string;
        route?: string;
        description?: string;
      };
      sections.push("**🔄 Fewest Transfers**\n");
      const routeDescription = getRouteDescription(ft);
      if (routeDescription) {
        sections.push(`* Route: ${routeDescription}`);
      }
      if (ft.cost) {
        sections.push(`* Cost: ${ft.cost}`);
      }
      const journeyTime = getJourneyTime(ft);
      if (journeyTime) {
        sections.push(`* Journey Time: ${journeyTime}`);
      }
      if ("payment_methods" in ft && typeof ft.payment_methods === "string") {
        sections.push(`* Payment Methods: ${ft.payment_methods}`);
      }
      sections.push("");
    }

    const leastWalking = (t as { least_walking?: unknown }).least_walking;
    if (leastWalking && typeof leastWalking === "object") {
      const lw = leastWalking as {
        cost?: string;
        payment_methods?: string;
        journey_time?: string;
        travel_time?: string;
        duration?: string;
        route_description?: string;
        route?: string;
        description?: string;
      };
      sections.push("**🚶 Least Walking**\n");
      const routeDescription = getRouteDescription(lw);
      if (routeDescription) {
        sections.push(`* Route: ${routeDescription}`);
      }
      if (lw.cost) {
        sections.push(`* Cost: ${lw.cost}`);
      }
      const journeyTime = getJourneyTime(lw);
      if (journeyTime) {
        sections.push(`* Journey Time: ${journeyTime}`);
      }
      if ("payment_methods" in lw && typeof lw.payment_methods === "string") {
        sections.push(`* Payment Methods: ${lw.payment_methods}`);
      }
      sections.push("");
    }
  }

  if (data.accommodation?.length) {
    sections.push("\n## 🏨 ACCOMMODATION\n");
    data.accommodation.forEach((hotel) => {
      sections.push(`* ${hotel.name} - £${hotel.price_per_night} per night`);
      if (hotel.distance_from_stadium) {
        sections.push(`* ${hotel.distance_from_stadium} from stadium`);
      }
      if (hotel.booking_info) {
        sections.push(`* Book: ${hotel.booking_info}`);
      }
      sections.push("");
    });
  }

  if (data.food_and_drink?.length) {
    sections.push("\n## 🍺 FOOD & DRINK RECOMMENDATIONS\n");
    data.food_and_drink.forEach((place) => {
      sections.push(`* ${place.name}`);
      if (place.distance_from_stadium) {
        sections.push(`* (${place.distance_from_stadium} from stadium)`);
      }
      if (place.description) {
        sections.push(`* ${place.description}`);
      }
      sections.push("");
    });
  }

  if (data.timeline?.length) {
    sections.push("\n## 🕐 YOUR MATCH DAY TIMELINE\n");
    data.timeline.forEach((item) => {
      const locationPart = item.location ? ` at ${item.location}` : "";
      const notePart = item.notes ? ` (${item.notes})` : "";
      sections.push(
        `* ${item.time} – ${item.activity}${locationPart}${notePart}`,
      );
    });
    sections.push("\nCome On You Hatters! 🧡\n");
  }

  if (data.cost_breakdown) {
    sections.push("\n## 💰 COST BREAKDOWN\n");
    sections.push("### Per Person:\n");
    const c = data.cost_breakdown;
    const currency = c.currency ?? "£";

    c.items?.forEach((item) => {
      sections.push(
        `**${item.label}:** ${item.currency ?? currency}${item.amount}`,
      );
    });

    if (c.total != null) {
      sections.push(`\n**TOTAL:** ${currency}${c.total}`);
    }
  }

  if (data.top_tips?.length) {
    sections.push("\n## 🎯 TOP TIPS\n");
    data.top_tips.forEach((tip, idx) => {
      sections.push(`${idx + 1}. ${tip}`);
    });
  }

  sections.push("\n## Come On You Hatters! 🧡🤍");

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
  content: string | JSX.Element[],
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

function renderMarkdown(text: string): string | JSX.Element[] {
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

  return parts.length === 0 ? text : parts;
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
        src={agentAvatar}
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
        messages.value = msgs.filter((_, i) => i !== idx);
      }
      // Re-send the most recent user message
      const lastUser = msgs
        .slice(0, idx === -1 ? undefined : idx)
        .reverse()
        .find((m) => !m.isAgent());
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
