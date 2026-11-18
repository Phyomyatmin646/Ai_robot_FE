import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Mic,
  MicOff,
  Send,
  Plus,
  Trash2,
  Square,
  Bot,
  User,
  Sparkles,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { conversationsApi } from '../../api/conversations.api';
import { audioApi } from '../../api/audio.api';
import { useSocket } from '../../context/SocketContext';
import { AuraBeacon } from '../../components/hud/AuraBeacon';
import { WaveformVisualizer } from '../../components/hud/WaveformVisualizer';
import { formatDate } from '../../utils/cn';
import type { Message } from '../../types';

export const ConversationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { robotState, activeTranscription, activeDeviceId } = useSocket();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations list
  const { data: convRes, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => conversationsApi.getConversations(),
  });
  const conversations = convRes?.data || [];

  // Auto select first conversation if none selected
  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  // Load messages for selected conversation
  const { data: msgRes, isLoading: msgLoading } = useQuery({
    queryKey: ['messages', selectedId],
    queryFn: () => conversationsApi.getMessages(selectedId!),
    enabled: Boolean(selectedId),
    refetchInterval: 3000,
  });
  const messages = msgRes?.data || [];

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTranscription]);

  // Create new session mutation
  const createMutation = useMutation({
    mutationFn: () =>
      conversationsApi.createConversation({
        title: `AI Session ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        deviceId: activeDeviceId || undefined,
        language: 'my',
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (res.data?.id) setSelectedId(res.data.id);
    },
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      conversationsApi.sendMessage(selectedId!, { content: text }),
    onSuccess: () => {
      setInputText('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Delete conversation mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => conversationsApi.deleteConversation(id),
    onSuccess: () => {
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Stop / barge-in robot audio playback
  const handleBargeIn = async () => {
    if (activeDeviceId) {
      try {
        await audioApi.stopOnDevice(activeDeviceId);
      } catch (e) {
        console.warn('Barge-in command failed:', e);
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedId) return;
    sendMutation.mutate(inputText.trim());
  };

  const activeConv = conversations.find((c) => c.id === selectedId);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Left Sidebar: Session List */}
      <div className="w-full md:w-80 flex flex-col rounded-3xl glass-card overflow-hidden shrink-0 border border-neutral-border">
        <div className="p-4 border-b border-neutral-border/60 flex items-center justify-between bg-white/40">
          <div>
            <h2 className="text-base font-display font-bold text-neutral-void">
              Voice & Chat Sessions
            </h2>
            <p className="text-[11px] font-mono text-neutral-slate">
              Gemini Live multimodal logs
            </p>
          </div>
          <button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="p-2 rounded-xl btn-primary text-white"
            title="Start New Voice Session"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-neutral-border/40 animate-pulse" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-slate">
              No sessions found. Create a new session to begin.
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = conv.id === selectedId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/30 shadow-sm'
                      : 'hover:bg-canvas-light border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary text-white' : 'bg-surface-container text-primary'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-neutral-void truncate">
                        {conv.title || 'Live Voice Session'}
                      </p>
                      <span className="text-[10px] font-mono text-neutral-slate">
                        {conv.messageCount} turns • {formatDate(conv.createdAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this conversation history?')) {
                        deleteMutation.mutate(conv.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-neutral-slate hover:text-rose-600 transition-opacity"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Area: Active Voice & Chat HUD */}
      <div className="flex-1 flex flex-col rounded-3xl glass-card overflow-hidden border border-neutral-border">
        {/* Header HUD */}
        <div className="p-4 px-6 border-b border-neutral-border/60 bg-white/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-primary">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-neutral-void">
                {activeConv?.title || 'Interactive Voice Console'}
              </h3>
              <p className="text-[11px] font-mono text-neutral-slate">
                Model: gemini-2.0-flash-live • Direct RFC 6455 Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AuraBeacon state={robotState} size="sm" showLabel={true} />

            {/* Barge-in Silence Button */}
            {robotState === 'speaking' && (
              <button
                onClick={handleBargeIn}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-100 transition-colors animate-pulse"
                title="Barge-in / Silence robot playback immediately"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Barge-in (Silence)</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Audio Waveform HUD Banner */}
        <div className="px-6 py-2 bg-canvas-light/60 border-b border-neutral-border/40">
          <WaveformVisualizer state={robotState} height={36} barCount={36} />
        </div>

        {/* Chat Stream Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {msgLoading ? (
            <div className="flex items-center justify-center h-full text-xs text-neutral-slate">
              Loading conversation transcript...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-neutral-void">Start Speaking or Type Below</p>
              <p className="text-xs text-neutral-slate max-w-sm">
                Speak directly to the physical ESP32 robot microphone, or send a prompt using the input bar below.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isUser
                        ? 'bg-primary text-white'
                        : 'bg-surface-container text-primary border border-primary/20'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`space-y-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-primary text-white rounded-tr-none shadow-sm'
                          : 'bg-white rounded-tl-none border border-neutral-border text-neutral-void shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-slate px-1">
                      <span>{formatDate(msg.createdAt)}</span>
                      {msg.latencyMs && (
                        <span className="flex items-center gap-0.5 text-primary">
                          <Zap className="w-2.5 h-2.5" />
                          {msg.latencyMs}ms
                        </span>
                      )}
                      {msg.tokens && <span>• {msg.tokens} tokens</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Real-time streaming transcription bubble */}
          {activeTranscription && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-surface-container text-aether flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-aether/10 border border-aether/30 text-neutral-void text-sm font-mono max-w-[80%]">
                <div className="flex items-center gap-1.5 text-[10px] text-aether font-semibold uppercase mb-1">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>Streaming speech-to-text...</span>
                </div>
                <p>{activeTranscription.text}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-4 border-t border-neutral-border/60 bg-white/70 flex items-center gap-3"
        >
          {/* Mic Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMicActive(!isMicActive)}
            className={`p-2.5 rounded-xl border transition-all ${
              isMicActive
                ? 'bg-aether text-white border-aether shadow-glow-cyan'
                : 'btn-glass text-neutral-slate hover:text-primary'
            }`}
            title={isMicActive ? 'Microphone Active' : 'Enable Web Microphone'}
          >
            {isMicActive ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type message or ask robot to perform actions..."
            className="flex-1 px-4 py-2.5 rounded-xl input-glass text-sm"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || sendMutation.isPending}
            className="px-4 py-2.5 rounded-xl btn-primary text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

