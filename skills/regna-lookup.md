---
name: regna-lookup
description: >
  Look up a Swedish company by org number or name using the Regna MCP server.
  EN: Use when the user asks "look up <company>", "what is <orgnr>", "find the
  Swedish company called X", or wants the registry profile (legal form, address,
  SNI codes, status) of a single company.
  SV: Använd när användaren säger "slå upp <företag>", "vad är <orgnr>",
  "hitta företaget X", eller vill se registerprofilen (bolagsform, adress,
  SNI-koder, status) för ett enskilt företag.
license: MIT
metadata:
  package: "@regna-verkt/claude-skills"
  version: "0.1.0"
  category: regna
---

# regna-lookup

Resolves a single Swedish company to its registry profile via the Regna MCP server.

## When to use

The user says any of these (English or Swedish):

- "Look up org number 5567037485" / "Slå upp organisationsnummer 5567037485"
- "What is Volvo's org number?" / "Vad är Volvos organisationsnummer?"
- "Find the Swedish company called Spotify" / "Hitta det svenska företaget Spotify"
- "Pull the registry profile for Klarna" / "Hämta registerprofilen för Klarna"
- "Is 5567037485 a real org number?" / "Är 5567037485 ett riktigt organisationsnummer?"

If the user wants financials, ownership, news, or a comparison across companies, use `regna-screen`, `regna-compare`, or `regna-research` instead.

**Language:** respond in the language the user prompted in. If they wrote in Swedish, the profile labels stay in Swedish ("Bolagsform", "Säte", "SNI", "Status"). If English, English labels.

## Tools it relies on

The Regna MCP server (install: `regna-mcp-server` on PyPI) must be configured. The skill assumes these tools are available:

- `lookup_company(org_number)` — registry profile by 10-digit org number
- `search_companies(query, limit)` — name or partial-name search
- `validate_org_number(org_number)` — Luhn check + existence

## Workflow

1. **If the user gave a 10-digit org number**, call `lookup_company` directly. Format the result as a short profile: name, legal form, registered address, SNI codes, registration status.

2. **If the user gave a company name**, call `search_companies` with `limit=10`. If exactly one obvious match is returned, proceed as in step 1 against that match. If multiple candidates, list them with org numbers and ask the user which one.

3. **If validation is the actual ask** ("is this real?"), use `validate_org_number` and report the verdict plainly.

## Output format

For a single company, present (English):

```
<Name> (<orgnr>)
Form: <legal form>
Registered: <address>, <county>
SNI: <sni_code> — <sni_description>
Status: <active | dissolved | etc.>
```

Or in Swedish:

```
<Namn> (<orgnr>)
Bolagsform: <form>
Säte: <adress>, <län>
SNI: <sni-kod> — <sni-beskrivning>
Status: <aktivt | upplöst | etc.>
```

Avoid filler ("Here is the company you asked about" / "Här är företaget du frågade efter"). The user already asked.

## What not to do

- Don't fabricate fields. If `lookup_company` returns no SNI, omit the SNI line.
- Don't translate the company name. Swedish AB and HB suffixes stay as-is.
- Don't compute valuations, health scores, or financial summaries — those belong to other skills.
