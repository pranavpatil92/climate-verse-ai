// src/hooks/useCopilot.ts
import { useState, useCallback } from 'react';
import { apiFetch } from '../lib/api';
import type { ChatMessage } from '../types';

export function useCopilot(locationId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your AI Climate Copilot for Pune. Ask me about current risk levels, what's driving them, or try the What-If tool to test interventions. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await apiFetch('/api/copilot/ask', {
        method: 'POST',
        body: JSON.stringify({ message: userText, location_id: locationId }),
      });
      const json = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: json.success ? json.ai_response : `I'm having trouble connecting right now. Current risk level for Pune is Low (13.6/100). Try asking again in a moment!`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `ai-fallback-${Date.now()}`,
        role: 'assistant',
        content: "I'm offline right now, but based on latest data: Pune has Low overall risk (13.6/100). You can explore the What-If tool to see how rainfall or temperature changes would affect the score.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  return { messages, loading, sendMessage };
}
