'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Maximize2, Minimize2, Plus, Trash2, Trash, EllipsisVertical, Calendar, Mail, Briefcase, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatMessage } from './ChatMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  locale: 'pl' | 'en';
}

interface QuickAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  message: string;
}

export function ChatWidget({ locale }: ChatWidgetProps) {
  const t = useTranslations('chat');
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const [sessions, setSessions] = useState<Array<{ id: string; title: string; messages: Message[]; threadId: string | null; updatedAt: number; seq: number }>>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showManageMenu, setShowManageMenu] = useState(false);

  const scrollToBottom = () => {
    if (listRef.current) {
      try {
        listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
        return;
      } catch {}
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    const id = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(id);
  }, [messages, isOpen, isExpanded, isLoading]);

  // Report chat layout (width) for positioning other floating UI (e.g., ScrollToTop)
  const reportLayout = () => {
    try {
      const width = isOpen ? Math.round(panelRef.current?.getBoundingClientRect().width || 0) : 0;
      window.dispatchEvent(new CustomEvent('chat:layout', { detail: { open: isOpen, width } }));
    } catch {}
  };

  useEffect(() => {
    reportLayout();
  }, [isOpen, isExpanded]);

  useEffect(() => {
    const onResize = () => reportLayout();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close manage menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showManageMenu && !(event.target as Element).closest('.manage-menu-container')) {
        setShowManageMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showManageMenu]);

  // Persistence in localStorage + cross-tab sync
  const STORAGE_KEY = 'chatSessions-v1';
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          let seqCounter = 0;
          const normalized = parsed.map((s: any) => ({ ...s, seq: typeof s.seq === 'number' ? s.seq : (++seqCounter), messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) }));
          setSessions(normalized);
          setActiveSessionId(normalized[0].id);
          setMessages(normalized[0].messages);
          setThreadId(normalized[0].threadId ?? null);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            let seqCounter = 0;
            const normalized = parsed.map((s: any) => ({ ...s, seq: typeof s.seq === 'number' ? s.seq : (++seqCounter), messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) }));
            setSessions(normalized);
            // Only update current session if it exists in the new data
            if (activeSessionId) {
              const found = normalized.find((s: any) => s.id === activeSessionId);
              if (found) {
                setMessages(found.messages);
                setThreadId(found.threadId ?? null);
              }
            }
          }
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [activeSessionId]);

  // Sync current session state when activeSessionId changes
  useEffect(() => {
    if (activeSessionId) {
      const found = sessions.find((s) => s.id === activeSessionId);
      if (found) {
        setMessages(found.messages);
        setThreadId(found.threadId ?? null);
      }
    } else {
      setMessages([]);
      setThreadId(null);
    }
  }, [activeSessionId, sessions]);

  const saveSessions = (next: typeof sessions) => {
    setSessions(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  };

  const createNewSession = () => {
    // Check if there's an empty session we can reuse
    const emptySession = sessions.find(s => s.messages.length === 0);
    if (emptySession) {
      setActiveSessionId(emptySession.id);
      setMessages([]);
      setThreadId(null);
      return;
    }

    const newId = `${Date.now()}`;
    const maxSeq = sessions.reduce((acc, s) => Math.max(acc, s.seq || 0), 0);
    const newSession = { id: newId, title: (t('newConversationTitle') as unknown as string) || 'New conversation', messages: [], threadId: null, updatedAt: Date.now(), seq: maxSeq + 1 };
    const next = [newSession, ...sessions];
    saveSessions(next);
    setActiveSessionId(newId);
    setMessages([]);
    setThreadId(null);
  };

  const switchSession = (id: string) => {
    const found = sessions.find((s) => s.id === id);
    if (found) {
      setActiveSessionId(id);
      setMessages(found.messages);
      setThreadId(found.threadId ?? null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    // ensure session exists and persist message
    let sid = activeSessionId;
    if (!sid) {
      sid = `${Date.now()}`;
      const maxSeq = sessions.reduce((acc, s) => Math.max(acc, s.seq || 0), 0);
      const newSession = { id: sid, title: (t('newConversationTitle') as unknown as string) || 'New conversation', messages: [userMessage], threadId, updatedAt: Date.now(), seq: maxSeq + 1 };
      saveSessions([newSession, ...sessions]);
      setActiveSessionId(sid);
    } else {
      const current = sessions.find((s) => s.id === sid);
      if (current) {
        const updated = { ...current, messages: [...current.messages, userMessage], updatedAt: Date.now() };
        saveSessions([updated, ...sessions.filter((s) => s.id !== sid)]);
      }
    }
    setInput('');
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const payload: any = { message: userMessage.content, locale };
      if (threadId) payload.threadId = threadId; // don't send null
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      }).finally(() => clearTimeout(timeout));

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };

        setMessages(prev => {
          const newMessages = [...prev, assistantMessage];
          // persist assistant message immediately after state update
          const curId = activeSessionId || sid;
          const cur = sessions.find((s) => s.id === curId);
          if (cur) {
            const updated2 = { ...cur, messages: newMessages, threadId: data.threadId ?? cur.threadId, updatedAt: Date.now() };
            saveSessions([updated2, ...sessions.filter((s) => s.id !== cur.id)]);
          }
          return newMessages;
        });
        if (data.threadId) setThreadId(data.threadId);
      } else {
        // Check for rate limit error (429)
        if (response.status === 429) {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: t('rateLimitMessage'),
            timestamp: new Date()
          };
          setMessages(prev => {
            const newMessages = [...prev, errorMessage];
            // persist rate limit message immediately after state update
            if (activeSessionId) {
              const cur = sessions.find((s) => s.id === activeSessionId);
              if (cur) {
                const upd = { ...cur, messages: newMessages, updatedAt: Date.now() };
                saveSessions([upd, ...sessions.filter((s) => s.id !== cur.id)]);
              }
            }
            return newMessages;
          });
          return;
        }
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('errorMessage'),
        timestamp: new Date()
      };
      setMessages(prev => {
        const newMessages = [...prev, errorMessage];
        // persist error message immediately after state update
        if (activeSessionId) {
          const cur = sessions.find((s) => s.id === activeSessionId);
          if (cur) {
            const upd = { ...cur, messages: newMessages, updatedAt: Date.now() };
            saveSessions([upd, ...sessions.filter((s) => s.id !== cur.id)]);
          }
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = async (message: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    // ensure session exists and persist message
    let sid = activeSessionId;
    if (!sid) {
      sid = `${Date.now()}`;
      const maxSeq = sessions.reduce((acc, s) => Math.max(acc, s.seq || 0), 0);
      const newSession = { id: sid, title: (t('newConversationTitle') as unknown as string) || 'New conversation', messages: [userMessage], threadId, updatedAt: Date.now(), seq: maxSeq + 1 };
      saveSessions([newSession, ...sessions]);
      setActiveSessionId(sid);
    } else {
      const current = sessions.find((s) => s.id === sid);
      if (current) {
        const updated = { ...current, messages: [...current.messages, userMessage], updatedAt: Date.now() };
        saveSessions([updated, ...sessions.filter((s) => s.id !== sid)]);
      }
    }
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      const payload: any = { message: userMessage.content, locale };
      if (threadId) payload.threadId = threadId; // don't send null
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      }).finally(() => clearTimeout(timeout));

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };

        setMessages(prev => {
          const newMessages = [...prev, assistantMessage];
          // persist assistant message immediately after state update
          const curId = activeSessionId || sid;
          const cur = sessions.find((s) => s.id === curId);
          if (cur) {
            const updated2 = { ...cur, messages: newMessages, threadId: data.threadId ?? cur.threadId, updatedAt: Date.now() };
            saveSessions([updated2, ...sessions.filter((s) => s.id !== cur.id)]);
          }
          return newMessages;
        });
        if (data.threadId) setThreadId(data.threadId);
      } else {
        // Check for rate limit error (429)
        if (response.status === 429) {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: t('rateLimitMessage'),
            timestamp: new Date()
          };
          setMessages(prev => {
            const newMessages = [...prev, errorMessage];
            // persist rate limit message immediately after state update
            if (activeSessionId) {
              const cur = sessions.find((s) => s.id === activeSessionId);
              if (cur) {
                const upd = { ...cur, messages: newMessages, updatedAt: Date.now() };
                saveSessions([upd, ...sessions.filter((s) => s.id !== cur.id)]);
              }
            }
            return newMessages;
          });
          return;
        }
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('errorMessage'),
        timestamp: new Date()
      };
      setMessages(prev => {
        const newMessages = [...prev, errorMessage];
        // persist error message immediately after state update
        if (activeSessionId) {
          const cur = sessions.find((s) => s.id === activeSessionId);
          if (cur) {
            const upd = { ...cur, messages: newMessages, updatedAt: Date.now() };
            saveSessions([upd, ...sessions.filter((s) => s.id !== cur.id)]);
          }
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'bookMeeting',
      icon: Calendar,
      label: t('quickActions.bookMeeting'),
      message: t('quickActions.bookMeetingMessage')
    },
    {
      id: 'contact',
      icon: Mail,
      label: t('quickActions.contact'),
      message: t('quickActions.contactMessage')
    },
    {
      id: 'specializations',
      icon: Briefcase,
      label: t('quickActions.specializations'),
      message: t('quickActions.specializationsMessage')
    },
    {
      id: 'websiteContent',
      icon: Globe,
      label: t('quickActions.websiteContent'),
      message: t('quickActions.websiteContentMessage')
    }
  ];

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
      >
        <Button onClick={() => { setIsOpen(true); try { window.dispatchEvent(new CustomEvent('chat:toggle', { detail: { open: true } })); } catch {} setTimeout(reportLayout, 0); }} className="h-14 w-14 rounded-full shadow-lg" size="icon" aria-label="Open chat">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </motion.div>

      {isOpen && (
        <motion.div
          className="fixed z-50"
          style={{ right: '1.5rem', bottom: '1.5rem' }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div ref={panelRef} className={isExpanded ? 'w-[min(720px,95vw)] h-[70vh]' : 'w-[min(460px,95vw)] h-[540px]'}>
            <div className="h-full flex flex-col rounded-lg bg-background border shadow-xl">
              <div className="flex items-center justify-between gap-2 px-3 py-2 border-b">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold truncate">{t('title')}</h3>
                </div>
                <div className="flex items-center justify-end gap-1 flex-wrap">
                  <select
                    className="border rounded px-1 py-1 text-xs max-w-[140px] bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary truncate"
                    value={activeSessionId ?? ''}
                    onChange={(e) => switchSession(e.target.value)}
                  >
                    <option value="" disabled>{(t('selectConversation') as unknown as string) || 'Select conversation'}</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>{(t('conversationN', { n: s.seq }) as unknown as string) || `Conversation ${s.seq}`}</option>
                    ))}
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={createNewSession}
                    aria-label={(t('newConversation') as unknown as string) || 'New conversation'}
                    title={(t('createNewConversation') as unknown as string) || 'Create new conversation'}
                    disabled={!activeSessionId || messages.length === 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <div className="relative manage-menu-container">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      aria-label={(t('manageConversations') as unknown as string) || 'Manage conversations'} 
                      title={(t('manageConversations') as unknown as string) || 'Manage conversations'}
                      onClick={() => setShowManageMenu(!showManageMenu)}
                    >
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                    {showManageMenu && (
                      <div className="absolute right-0 mt-1 w-64 rounded-md border bg-popover text-popover-foreground shadow-md p-3 z-[60]">
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => {
                              if (!activeSessionId) return;
                              const confirmed = window.confirm((t('deleteConversationConfirm') as unknown as string) || 'Delete this conversation?');
                              if (!confirmed) return;
                              const next = sessions.filter((s) => s.id !== activeSessionId);
                              saveSessions(next);
                              if (next.length > 0) {
                                setActiveSessionId(next[0].id);
                                setMessages(next[0].messages);
                                setThreadId(next[0].threadId);
                              } else {
                                setActiveSessionId(null);
                                setMessages([]);
                                setThreadId(null);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {(t('deleteCurrent') as unknown as string) || 'Delete current conversation'}
                          </Button>
                          
                          <div className="flex gap-2">
                            <select
                              className="flex-1 border rounded px-2 py-1 text-xs bg-background text-foreground"
                              onChange={(e) => {
                                const id = e.target.value;
                                if (!id) return;
                                const confirmed = window.confirm((t('deleteConversationConfirm') as unknown as string) || 'Delete this conversation?');
                                if (!confirmed) return;
                                const next = sessions.filter((s) => s.id !== id);
                                saveSessions(next);
                                if (activeSessionId === id) {
                                  if (next.length > 0) {
                                    setActiveSessionId(next[0].id);
                                    setMessages(next[0].messages);
                                    setThreadId(next[0].threadId);
                                  } else {
                                    setActiveSessionId(null);
                                    setMessages([]);
                                    setThreadId(null);
                                  }
                                }
                                // reset select
                                e.currentTarget.selectedIndex = 0;
                              }}
                              defaultValue=""
                              disabled={sessions.filter(s => s.messages.length > 0).length === 0}
                            >
                              <option value="" disabled>{(t('selectConversationToDelete') as unknown as string) || 'Select conversation to delete'}</option>
                              {sessions.filter(s => s.messages.length > 0).map((s) => (
                                <option key={s.id} value={s.id}>{(t('conversationN', { n: s.seq }) as unknown as string) || `Conversation ${s.seq}`}</option>
                              ))}
                            </select>
                            
                          </div>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              const confirmed = window.confirm((t('deleteAllConversationsConfirm') as unknown as string) || 'Delete all conversations?');
                              if (!confirmed) return;
                              saveSessions([]);
                              setActiveSessionId(null);
                              setMessages([]);
                              setThreadId(null);
                            }}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            {(t('deleteAllConversations') as unknown as string) || 'Delete all'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsExpanded((v) => !v)} aria-label={isExpanded ? ((t('shrink') as unknown as string) || 'Shrink') : ((t('expand') as unknown as string) || 'Expand')}>
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setIsOpen(false); try { window.dispatchEvent(new CustomEvent('chat:toggle', { detail: { open: false } })); window.dispatchEvent(new CustomEvent('chat:layout', { detail: { open: false, width: 0 } })); } catch {} }} aria-label="Close chat">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col p-0">
                <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted-foreground/30">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground space-y-4">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>{t('welcomeMessage')}</p>
                      
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">{t('quickActions.title')}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {quickActions.map((action) => {
                            const IconComponent = action.icon;
                            return (
                              <Button
                                key={action.id}
                                variant="outline"
                                size="sm"
                                className="h-auto p-3 flex flex-col items-center gap-2 text-xs"
                                onClick={() => handleQuickAction(action.message)}
                              >
                                <IconComponent className="h-4 w-4" />
                                <span className="text-center leading-tight">{action.label}</span>
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {messages.map((m) => (
                    <ChatMessage key={m.id} message={m} />
                  ))}

                  {isLoading && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('typing')}</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t">
                  <div className="flex space-x-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('inputPlaceholder')}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!input.trim() || isLoading} size="icon" aria-label={(t('send') as unknown as string) || 'Send'}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}


