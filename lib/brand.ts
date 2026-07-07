// Single active bank for the current demo. Swap this file by running
// `npm run demo:new -- --url https://<bank>.com --name "<Bank Name>"`.
// The site shell stays branded as Emerie for now; only the chatbot's
// knowledge, persona name reference, and Ultravox corpus id change.

export type BrandConfig = {
  name: string;
  slug: string;
  homepage: string;
  // When set, the voice route uses Ultravox's queryCorpus tool (RAG on their
  // hosted corpus) instead of injecting the local kb/*.md files inline.
  // The chat route ALWAYS reads local kb/*.md files.
  ultravoxCorpusId: string | null;
};

export const BRAND: BrandConfig = {
  name: "Emerie First Bank",
  slug: "emerie-first-bank",
  homepage: "https://emeriefirstbank.com",
  ultravoxCorpusId: null,
};
