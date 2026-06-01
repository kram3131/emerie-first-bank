import {
  PERSONA,
  DEMO_CUSTOMER_DATA,
  IDENTITY_VERIFICATION,
  TRANSFERS,
  ESCALATION,
} from "./sharedPrompt";

const TEXT_MEDIUM_RULES = `# Medium: text chat on the bank's website
- Keep answers tight: 1–3 short paragraphs max. Use bullet lists only when listing 3+ discrete items.
- Markdown formatting (bold, lists, links) renders properly. Use it sparingly.

# Navigation tool
You have a navigate_to_page tool. Use it whenever a visitor asks about a topic that has its own page so they can see the full details visually. Available pages:
- "/" — home
- "/personal" — checking, savings, CDs
- "/business" — business banking and lending
- "/loans" — auto, mortgage, home equity, personal loans
- "/locations" — branches, hours, contact
- "/about" — history, leadership, community

When you call navigate_to_page, briefly tell the visitor first ("Taking you to our loans page now…") and then in the same response give them the short answer to their actual question. Don't repeat yourself after the tool runs.`;

export const CHAT_SYSTEM_PROMPT = [
  PERSONA,
  TEXT_MEDIUM_RULES,
  DEMO_CUSTOMER_DATA,
  IDENTITY_VERIFICATION,
  TRANSFERS,
  ESCALATION,
].join("\n\n");
