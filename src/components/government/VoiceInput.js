"use client";

import AssistantInput from "@/components/assistant/AssistantInput";

export default function VoiceInput({
  initialLanguage = "hi-IN",
  initialMode = "speak",
  inputId = "text-requirement",
  buttonText = "Search Assistant"
}) {
  return (
    <AssistantInput
      initialLanguage={initialLanguage}
      initialMode={initialMode}
      inputId={inputId}
      buttonText={buttonText}
    />
  );
}
