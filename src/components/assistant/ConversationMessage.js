"use client";

import { useState } from "react";

export default function ConversationMessage({
  role = "assistant", // "user" | "assistant" | "system"
  content = "",
  timestamp = null,
  language = null,
  audioUrl = null,
  onSpeak = null,
  isSpeaking = false
}) {
  const isUser = role === "user";
  const isSystem = role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
          <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 my-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
        isUser 
          ? "bg-slate-900 text-white" 
          : "bg-blue-600 text-white"
      }`}>
        {isUser ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
        isUser
          ? "bg-blue-600 text-white rounded-tr-none"
          : "bg-white border border-[#E5EAF1] text-[#17243A] rounded-tl-none"
      }`}>
        <div className="flex items-center justify-between gap-3 mb-1 text-xs">
          <span className={`font-semibold ${isUser ? "text-blue-100" : "text-[#14233B]"}`}>
            {isUser ? "You (Citizen)" : "YojanaSathi AI Assistant"}
          </span>
          <div className="flex items-center gap-2">
            {language && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                isUser ? "bg-blue-700/50 text-blue-100" : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                {language}
              </span>
            )}
            {timestamp && (
              <span className={isUser ? "text-blue-200" : "text-[#68758A]"}>
                {timestamp}
              </span>
            )}
          </div>
        </div>

        {/* Message body */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words font-normal">
          {content}
        </div>

        {/* Read aloud action if available for assistant */}
        {!isUser && onSpeak && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onSpeak}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                isSpeaking
                  ? "bg-blue-100 text-blue-700 animate-pulse"
                  : "bg-slate-50 text-[#68758A] hover:bg-slate-100 hover:text-[#17243A]"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <span>{isSpeaking ? "Speaking..." : "Listen Aloud"}</span>
            </button>

            <span className="text-[11px] text-[#68758A]">
              Official NLP Engine
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

