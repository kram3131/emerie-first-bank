// Account numbers and PINs are collected as freeform chat/voice input during
// identity verification (see IDENTITY_VERIFICATION in sharedPrompt.ts). The
// raw value still needs to reach the backend, but it should never be echoed
// back to the screen in plaintext.
export function maskSensitiveInput(text: string): string {
  const trimmed = text.trim();
  if (/^\d{4,9}$/.test(trimmed)) {
    return "•".repeat(trimmed.length);
  }
  return text;
}
