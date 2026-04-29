---
name: regna-screen
description: >
  Screen Swedish companies by industry, revenue, geography, or growth using
  the Regna MCP server.
  EN: Use when the user asks for a list ("Swedish SaaS companies with revenue
  over X", "fastest-growing logistics firms in Stockholm", "companies in SNI
  62.01 with declining margins").
  SV: Använd när användaren ber om en lista ("svenska SaaS-bolag med omsättning
  över X", "snabbast växande logistikföretag i Stockholm", "bolag i SNI 62.01
  med fallande marginal").
license: MIT
metadata:
  package: "@regnaverkt/claude-skills"
  version: "0.1.0"
  category: regna
---

# regna-screen

Filters the Swedish company universe down to a list matching the user's criteria.

## When to use

The user is asking for a *list*, not a single company:

- "Swedish SaaS companies that doubled revenue last year" / "Svenska SaaS-bolag som dubblade omsättningen i fjol"
- "Companies in Stockholm with revenue over 500M SEK" / "Bolag i Stockholm med omsättning över 500 MSEK"
- "Fastest-growing logistics firms" / "Snabbast växande logistikbolag"
- "Manufacturing companies in SNI 25.x with declining margins" / "Tillverkningsbolag i SNI 25.x med sjunkande marginal"

For a single company profile, use `regna-lookup`.
For comparing two specific companies, use `regna-compare`.

**Language:** mirror the user's prompt language in the table headers and the closing summary. SEK stays SEK in both languages.

## Tools it relies on

- `search_companies(query, limit)` — text and partial-name search
- `get_financials(org_number, period)` — annual or quarterly financials
- `get_analysis(org_number)` — health score, valuation, risk
- `get_similar_companies(org_number, limit)` — peer-group expansion

## Workflow

1. **Translate the user's criteria** into:
   - A seed query (industry keyword, SNI prefix, geography, or a known peer)
   - A set of post-filters (revenue range, growth threshold, region)

2. **Cast a wide net first.** Call `search_companies` with the broadest text query that still feels relevant. Use `limit=25` (the API max) to keep the candidate pool generous.

3. **For each candidate**, call `get_financials` and `get_analysis` as needed. Apply the post-filters in your own logic — the API doesn't run arbitrary filters server-side.

4. **Rank and trim.** Pick the top ~10 by whatever the user implied (revenue, growth, margin, health score). Surface fewer rows with clear values rather than many rows with sparse data.

5. **Cite the source.** End with one line on what was screened ("Screened across ~40 candidates from the SNI 62.01 segment, ranked by 2024 revenue").

## Output format

Markdown table:

| Company | Org nr | Revenue (SEK) | YoY growth | Health |
|---|---|---|---|---|
| <Name> | <orgnr> | … | … | … |

Sort descending on whatever metric the user implied. Limit to ~10 rows.

## What not to do

- Don't run dozens of `get_financials` calls in parallel against the whole result set without trimming first. The user has a quota.
- Don't speculate about companies the API didn't return.
- Don't apply filters silently. State the criteria you used.
