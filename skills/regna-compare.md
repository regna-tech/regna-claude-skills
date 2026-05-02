---
name: regna-compare
description: >
  Compare two or more Swedish companies side-by-side on financials, health, and
  ownership using the Regna MCP server.
  EN: Use when the user asks "compare X and Y", "which is bigger, A or B?",
  "who's more profitable", or wants a head-to-head on Swedish firms.
  SV: Använd när användaren säger "jämför X och Y", "vem är störst, A eller
  B?", "vem är mest lönsam", eller vill ha en direkt jämförelse mellan
  svenska bolag.
license: MIT
metadata:
  package: "@regna-verkt/claude-skills"
  version: "0.1.0"
  category: regna
---

# regna-compare

Produces a side-by-side comparison of two to four Swedish companies on the dimensions Regna covers: registry profile, annual and quarterly financials, health and valuation, and recent events.

## When to use

The user names two or more specific companies:

- "Compare Spotify AB and Klarna AB" / "Jämför Spotify AB och Klarna AB"
- "Who's bigger, Volvo Cars or Volvo Group?" / "Vem är störst, Volvo Cars eller Volvo Group?"
- "Stack H&M against Lindex on margins" / "Ställ H&M mot Lindex på marginal"
- "Pit IKEA against Jysk on the Swedish side" / "Sätt IKEA mot Jysk på den svenska sidan"

For listing companies that *match* criteria, use `regna-screen`.
For a single company deep dive, use `regna-research`.

**Language:** mirror the user's prompt language. Swedish prompt → "Omsättning", "Rörelseresultat", "Eget kapital", "Hälsoindex". English prompt → "Revenue", "Operating result", "Equity", "Health score".

## Tools it relies on

- `lookup_company(org_number)` — registry profile
- `get_financials(org_number, period)` — annual financials are the default; pull quarterly only if the user asks for recent quarters
- `get_analysis(org_number)` — health score, valuation, risk
- `get_similar_companies(org_number, limit)` — only if the user wants peer context

## Workflow

1. **Resolve each company to an org number.** Use `regna-lookup`'s logic if needed — `search_companies` for names, then disambiguate.

2. **Fetch the same set of fields for every company.** Don't pull `get_financials` for one but skip it for another — comparisons fall apart on uneven data.

3. **Default dimensions to compare**, in order:
   - Revenue (latest full year)
   - YoY revenue growth
   - Operating result and margin
   - Equity and equity ratio
   - Health score (`get_analysis`)
   - Headcount (if available from registry)

4. **Honour explicit asks.** If the user said "compare on margins", lead with margins and trim the rest.

5. **Note the year.** The latest filing year may differ across companies (one filed 2024, another only 2023). State the year on each row.

## Output format

Single markdown table, columns are companies, rows are dimensions:

| | Company A | Company B |
|---|---|---|
| Org nr | … | … |
| Revenue (latest) | 2024: X SEK | 2023: Y SEK |
| YoY growth | … | … |
| Operating margin | … | … |
| Health score | … | … |

Below the table, two or three sentences on the qualitative gap — *not* a recommendation, just what the numbers show.

## What not to do

- Don't recommend one over the other unless the user explicitly asked. The user knows the context you don't.
- Don't omit a company because its data is sparse — show the gap honestly.
- Don't translate currency. Stay in SEK.
- Don't compare companies in radically different SNI codes without flagging it ("These are in different sectors — direct comparison is rough").
