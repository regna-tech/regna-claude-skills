---
name: regna-research
description: >
  Build a one-page research note on a Swedish company using the Regna MCP
  server — registry, financials, health, ownership, peers, and recent events.
  EN: Use when the user asks "tell me about X", "research <company>", "give me
  a one-pager on Y", or wants a deep-dive single-company profile.
  SV: Använd när användaren säger "berätta om X", "research <bolag>", "ge mig
  ett en-sidigt PM om Y", eller vill ha en djupdykning i ett enskilt bolag.
license: MIT
metadata:
  package: "@regna-verkt/claude-skills"
  version: "0.1.0"
  category: regna
---

# regna-research

Produces a one-page research note on a single Swedish company by chaining every relevant Regna tool.

## When to use

- "Research Spotify AB" / "Research Spotify AB"
- "Give me a one-pager on Klarna" / "Ge mig ett en-sidigt PM om Klarna"
- "Tell me about org 5567037485" / "Berätta om bolag 5567037485"
- "Build a brief on Northvolt" / "Sammanställ ett PM om Northvolt"
- "I'm meeting H&M next week, what should I know?" / "Jag träffar H&M nästa vecka, vad behöver jag veta?"

For a quick registry lookup, use `regna-lookup`.
For lists / screening, use `regna-screen`.
For head-to-head, use `regna-compare`.

**Language:** mirror the user's prompt language throughout the one-pager. Section headings, table headers, and narrative all swap together. SEK and SNI codes stay as-is in both languages.

## Tools it relies on

Every Regna MCP tool. In typical call order:

1. `lookup_company(org_number)` or `search_companies(query)` — resolve the target
2. `get_financials(org_number, period="annual")` — multi-year revenue and result
3. `get_financials(org_number, period="quarterly")` — only if the user wants recency
4. `get_analysis(org_number)` — health score, valuation, risk
5. `get_company_events(org_number)` — recent news, filings, registry changes
6. `get_similar_companies(org_number, limit=5)` — peer context
7. `get_reports(org_number)` — list of source filings (cite, don't dump)

## Workflow

1. **Resolve the company.** If the user gave a name, search and disambiguate.

2. **Pull data in parallel where possible.** Steps 2-6 above are independent — fire them concurrently to keep the user wait short.

3. **Compose the one-pager.** Don't dump the raw API responses; synthesise. Stick to the structure below.

4. **Cite source filings.** When stating a financial number, mention the filing year. The user can dig into specifics via `get_reports` if needed — surface that as a footnote, not the body.

## Output format

```
# <Company name> (<org nr>)
*<Legal form> · Registered <year> · <city>, <county> · <SNI code – industry>*

## Snapshot
<Two or three sentences on what the company does and how big it is.>

## Financials
| | <Year n> | <Year n-1> | <Year n-2> |
|---|---|---|---|
| Revenue | … | … | … |
| Operating result | … | … | … |
| Margin | … | … | … |
| Equity | … | … | … |

## Health and valuation
- Health score: <0-100> (<one-line interpretation>)
- Risk flags: <list, or "none surfaced">
- Valuation indicators: <if get_analysis returned them>

## Recent events
<3-5 bullets from get_company_events. Skip filler ("annual report filed"); keep
material moves: leadership changes, capital events, strategic announcements.>

## Peers
<3-5 from get_similar_companies, with one-line context on each.>

## Source filings
<Cite the most recent filings get_reports surfaced. One line each.>
```

## What not to do

- Don't pad sections that came back empty. Drop them; honesty beats symmetry.
- Don't add commentary the data doesn't support ("they seem to be doing well") — let the numbers speak.
- Don't translate the company name or normalize the SNI description.
- Don't make multiple `get_financials` calls for the same company in different periods unless the user asked. The default `period="annual"` is enough for the financials table.
- Don't include a generic disclaimer. The user knows this is registry data.
