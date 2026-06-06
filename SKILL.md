# OhMyKick Core Mechanics Reference (SKILL.md)

This document details the core state-machine, data validation, and asynchronous processing rules governing the OhMyKick prediction platform. Refer to this when implementing and maintaining core logic.

---

## 1. Bot State Transitions

The bot utilizes a state-machine per user, stored in `users.conversation_state`.

```
        [NEW / First Msg]
                │
                ▼
       [ONBOARDING_NAME] ────► (Validates text length 2-40)
                │
                ▼
      [ONBOARDING_COUNTRY] ──► (Dropdown select from 32 teams)
                │
                ▼
       [ONBOARDING_PHOTO] ───► (Upload photo OR skip for flag avatar)
                │
                ▼
             [IDLE] ◄─────────────────────────┐
          (Main menu)                         │
                │                             │
        (Triggers predict)                    │
                │                             │
                ▼                             │
    [PREDICTION_MATCH_SELECT]                 │
                │                             │
                ▼                             │
       [PREDICTION_WINNER] ──► (Saves match)   │
                │                             │
                ▼                             │
        [PREDICTION_SCORE] ───► (Validates) ──┘
```

### State Definitions
- `NEW`: Triggered by first greeting. Directs to Onboarding.
- `ONBOARDING_NAME`: Collects name. Validate: 2-40 characters, letters/spaces only.
- `ONBOARDING_COUNTRY`: Collects supported team from 32 qualified nations.
- `ONBOARDING_PHOTO`: Collects profile picture. If skipped, uses national flag as default avatar.
- `IDLE`: Safe resting state. Handles global command keywords.
- `PREDICTION_MATCH_SELECT`: Displays active matches available for prediction.
- `PREDICTION_WINNER`: Captures selected winner prediction (`HOME`, `DRAW`, or `AWAY`).
- `PREDICTION_SCORE`: Captures exact score, triggers validation, locks prediction, queues poster.

---

## 2. Score Parser & Consistency Rules

### Regex Parsing
Fuzzy match score from text input:
- Target patterns: `\b(\d{1,2})\s*[-:–\s]\s*(\d{1,2})\b`
- Examples: `"2-1"`, `"2 - 1"`, `"2:1"`, `"2 1"`, `"2–1"` (en-dash)
- Extract: First integer as home team goals ($G_H$), second integer as away team goals ($G_A$).

### Consistency Check
Let $P_W$ represent the predicted winner (`HOME`, `DRAW`, or `AWAY`).
- If $P_W = \text{HOME}$: $G_H > G_A$ must hold true. If not, reject.
- If $P_W = \text{AWAY}$: $G_A > G_H$ must hold true. If not, reject.
- If $P_W = \text{DRAW}$: $G_H = G_A$ must hold true. If not, auto-correct $G_A = G_H$.
- Bounds: Goals must be between `0` and `20` inclusive.

### Retry Limit
- Track consecutive validation failures in `users.state_retries`.
- On $3\text{rd}$ invalid attempt, reset state to `IDLE` and return user to the main menu with a friendly re-prompt.

---

## 3. Streak Count Calculations

Streaks represent consecutive days of prediction activity. Updated upon successful prediction confirmation:

1. Let $T$ be today's date (UTC or user local timezone) in `YYYY-MM-DD` format.
2. Let $Y$ be yesterday's date in `YYYY-MM-DD` format.
3. Compare with the user's `last_prediction_date`:
   - If `last_prediction_date` equals $T$: Do nothing (already updated today).
   - If `last_prediction_date` equals $Y$: Increment `streak_count` by 1.
   - Else: Reset `streak_count` to 1.
4. Set `last_prediction_date` to $T$.

---

## 4. Async Queue Details (BullMQ)

### Queue Roles
- `posterQueue`: Render poster images asynchronously. Worker fetches from Next.js Vercel OG, uploads PNG binary to Supabase Storage bucket, updates DB ref.
- `notifyQueue`: Send messages and generated media. Workers interact with Telegram/WhatsApp API senders. Concurrency is configured to prevent API rate-limit exhaustion.

### WhatsApp 24h Window Rule
Meta charges for outbound templates but offers free conversation windows if the user initiated contact within the last 24 hours.
- If user `last_wa_message_at` is $< 24$ hours ago: Send direct image message with caption.
- If user `last_wa_message_at` is $\ge 24$ hours ago: Send approved Utility Template message (`result_ready`) to invite them to query their poster.
