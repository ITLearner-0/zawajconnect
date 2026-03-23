import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Moon, Send, BookOpen, Heart, Sparkles, MessageCircle,
  User, ChevronRight, Plus, Trash2, History
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationSession {
  session_id: string;
  context_type: string;
  first_message: string;
  created_at: string;
}

const contextOptions = [
  { value: 'general', label: 'Conseils généraux', icon: '💬', description: 'Questions sur le mariage en Islam' },
  { value: 'profile_review', label: 'Analyser mon profil', icon: '👤', description: 'Améliorer votre profil de recherche' },
  { value: 'compatibility', label: 'Compatibilité', icon: '💕', description: "Comprendre une compatibilité avec un profil" },
  { value: 'preparation', label: 'Préparer une rencontre', icon: '📋', description: 'Se préparer pour une khitba ou rencontre' },
];

// System prompt for the advisor (used with edge function)
const SYSTEM_CONTEXT = `Vous êtes un conseiller matrimonial islamique bienveillant et savant. Vous vous basez sur le Coran, la Sunnah et les avis des savants classiques (Ibn Qayyim, An-Nawawi, Ibn Taymiyya). Vous refusez toute demande romantique ou inappropriée. Vous conseillez avec sagesse et douceur.`;

// Fallback responses when edge function is not available
const fallbackResponses: Record<string, string[]> = {
  general: [
    "Le mariage en Islam est un acte d'adoration (ibâda). Le Prophète ﷺ a dit : « Le mariage fait partie de ma Sunnah. Celui qui s'en détourne ne fait pas partie de moi. » (Ibn Mâjah)\n\nPour une démarche bénie, assurez-vous de :\n1. Purifier votre intention (niyya) — chercher la satisfaction d'Allah\n2. Impliquer votre Wali dès le début\n3. Faire l'Istikhara avant chaque décision importante\n4. Ne pas se précipiter\n\nQue souhaitez-vous approfondir ?",
    "La patience dans la recherche du conjoint est une vertu islamique. Le Prophète ﷺ a dit : « La patience est lumière » (Muslim).\n\nSi vous traversez une période difficile dans votre recherche, rappelez-vous que le qadar (décret) d'Allah est toujours le meilleur pour vous. Concentrez-vous sur votre développement personnel et spirituel en attendant.\n\nComment puis-je vous aider plus spécifiquement ?",
  ],
  profile_review: [
    "Pour un profil efficace et islamiquement correct, voici mes conseils :\n\n**Honnêteté (Sidq) :** Décrivez-vous tel que vous êtes. Le Prophète ﷺ a interdit la tromperie.\n\n**Section « À propos » :** Mentionnez votre pratique religieuse, vos valeurs, votre vision de la famille. Soyez concret.\n\n**Photo :** Si vous en mettez une, qu'elle soit décente et représentative. Utilisez les niveaux de confidentialité.\n\n**Critères :** Soyez réaliste. Des critères trop restrictifs peuvent vous faire passer à côté de la bonne personne.\n\nSouhaitez-vous que j'analyse un aspect spécifique de votre profil ?",
  ],
  compatibility: [
    "Pour évaluer la compatibilité islamique, voici les critères prioritaires selon les savants :\n\n1. **Ad-Dîn (la religion)** — C'est le critère n°1 selon le hadith de Bukhârî\n2. **Al-Khuluq (le caractère)** — « Si quelqu'un dont vous êtes satisfaits du caractère vous demande en mariage, mariez-le » (Tirmidhî)\n3. **Al-Kafâ'a (l'équivalence)** — Niveau social, éducation, origine compatible\n4. **Les objectifs de vie communs** — Enfants, lieu de vie, ambitions\n\nUne compatibilité de 100% n'existe pas. L'important est de partager les fondamentaux et d'être prêts à travailler ensemble sur les différences.\n\nSur quel aspect de la compatibilité avez-vous des questions ?",
  ],
  preparation: [
    "Préparer une rencontre (khitba) est une étape sérieuse. Voici un guide :\n\n**Avant la rencontre :**\n- Faites l'Istikhara\n- Préparez une liste de questions essentielles\n- Informez votre Wali et préparez-le aussi\n\n**Questions à poser :**\n- Quelle est votre vision du foyer islamique ?\n- Comment voyez-vous l'éducation des enfants ?\n- Quelle est votre relation avec votre famille ?\n- Comment gérez-vous les désaccords ?\n\n**Pendant la rencontre :**\n- Restez naturel(le)\n- La présence du Wali est obligatoire\n- Observez le comportement, pas seulement les paroles\n\n**Après :**\n- Prenez le temps de réfléchir (7 jours d'Istikhara)\n- Ne vous engagez pas sous la pression\n\nQue souhaitez-vous approfondir ?",
  ],
};

const NikahAdvisor = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [contextType, setContextType] = useState('general');
  const [sessionId, setSessionId] = useState<string>(crypto.randomUUID());
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initial greeting
    setMessages([{
      id: '0',
      role: 'assistant',
      content: `Assalamu alaykum wa rahmatullahi wa barakatuh ! 🌙\n\nJe suis votre conseiller Nikah, ici pour vous accompagner dans votre démarche matrimoniale selon les enseignements de l'Islam.\n\nJe peux vous aider avec :\n• **Conseils généraux** sur le mariage en Islam\n• **Analyser votre profil** et le rendre plus attractif\n• **Évaluer une compatibilité** avec un profil\n• **Préparer une rencontre** (khitba)\n\nChoisissez un contexte ci-dessus ou posez directement votre question.`,
      timestamp: new Date(),
    }]);

    if (user) loadSessions();
  }, [user]);

  const loadSessions = async () => {
    try {
      const { data } = await supabase
        .from('ai_advisor_conversations')
        .select('session_id, context_type, content, created_at')
        .eq('user_id', user!.id)
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (data) {
        const uniqueSessions = new Map<string, ConversationSession>();
        for (const row of data) {
          if (!uniqueSessions.has(row.session_id)) {
            uniqueSessions.set(row.session_id, {
              session_id: row.session_id,
              context_type: row.context_type || 'general',
              first_message: row.content.substring(0, 60) + (row.content.length > 60 ? '...' : ''),
              created_at: row.created_at,
            });
          }
        }
        setSessions(Array.from(uniqueSessions.values()));
      }
    } catch {
      // Table might not exist
    }
  };

  const loadSession = async (sid: string) => {
    try {
      const { data } = await supabase
        .from('ai_advisor_conversations')
        .select('*')
        .eq('session_id', sid)
        .order('created_at');

      if (data) {
        setSessionId(sid);
        setMessages(data.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: new Date(m.created_at),
        })));
        setShowHistory(false);
      }
    } catch {
      // Continue
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Save to Supabase
    if (user) {
      try {
        await supabase.from('ai_advisor_conversations').insert({
          user_id: user.id,
          session_id: sessionId,
          role: 'user',
          content: messageText,
          context_type: contextType,
        });
      } catch {
        // Continue
      }
    }

    // Try edge function first, fallback to static responses
    let responseText: string;
    try {
      const { data, error } = await supabase.functions.invoke('nikah-advisor', {
        body: {
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          context_type: contextType,
        },
      });

      if (error || !data?.content) throw new Error('Edge function unavailable');
      responseText = data.content;
    } catch {
      // Fallback to pre-built responses
      const pool = fallbackResponses[contextType] || fallbackResponses.general;
      responseText = pool[Math.floor(Math.random() * pool.length)];
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date(),
    };

    // Save assistant response
    if (user) {
      try {
        await supabase.from('ai_advisor_conversations').insert({
          user_id: user.id,
          session_id: sessionId,
          role: 'assistant',
          content: responseText,
          context_type: contextType,
        });
      } catch {
        // Continue
      }
    }

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const startNewSession = () => {
    setSessionId(crypto.randomUUID());
    setMessages([{
      id: '0',
      role: 'assistant',
      content: "Nouvelle conversation démarrée. Bismillah. Comment puis-je vous aider ?",
      timestamp: new Date(),
    }]);
    setShowHistory(false);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
              <Moon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Assistant Nikah</h1>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Conseiller matrimonial islamique</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
              <History className="h-4 w-4 mr-1" /> Historique
            </Button>
            <Button variant="outline" size="sm" onClick={startNewSession}>
              <Plus className="h-4 w-4 mr-1" /> Nouveau
            </Button>
          </div>
        </div>

        {/* Context Selector */}
        <div className="pb-3">
          <Select value={contextType} onValueChange={setContextType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Contexte de la conversation" />
            </SelectTrigger>
            <SelectContent>
              {contextOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  <span className="flex items-center gap-2">
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                    <span className="text-xs ml-1" style={{ color: 'var(--color-text-muted)' }}>— {opt.description}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* History Panel */}
        {showHistory && sessions.length > 0 && (
          <Card className="mb-3 max-h-48 overflow-y-auto" style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
            <CardContent className="pt-4 space-y-2">
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Conversations précédentes</p>
              {sessions.slice(0, 10).map((s) => (
                <div
                  key={s.session_id}
                  className="flex items-center gap-2 p-2 rounded-lg cursor-pointer"
                  style={{ borderRadius: 'var(--radius-md)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => loadSession(s.session_id)}
                >
                  <MessageCircle className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{s.first_message}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(s.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {contextOptions.find((c) => c.value === s.context_type)?.icon}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.role === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                }`}
                style={
                  message.role === 'user'
                    ? { backgroundColor: 'var(--color-primary)', color: '#fff' }
                    : { backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)' }
                }
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>Assistant Nikah</span>
                  </div>
                )}
                <div className={`text-sm leading-relaxed whitespace-pre-line`} style={message.role === 'assistant' ? { color: 'var(--color-text-secondary)' } : {}}>
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md p-4" style={{ backgroundColor: 'var(--color-bg-subtle)', border: '1px solid var(--color-border-default)' }}>
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-primary-muted)' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-primary-muted)', animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--color-primary-muted)', animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions (shown when few messages) */}
        {messages.length <= 2 && (
          <div className="pb-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                "Comment choisir le bon conjoint en Islam ?",
                "Comment faire l'Istikhara pour le mariage ?",
                "Quelles questions poser lors d'une khitba ?",
                "Comment améliorer mon profil ?",
              ].map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  className="h-auto py-2 px-3 text-left justify-start text-xs"
                  onClick={() => handleSend(q)}
                >
                  <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="line-clamp-2">{q}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="pt-3" style={{ borderTop: '1px solid var(--color-border-default)' }}>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Posez votre question..."
              disabled={isTyping}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs mt-2 text-center" style={{ color: 'var(--color-text-muted)' }}>
            Basé sur le Coran, la Sunnah et les avis des savants. Pour des questions spécifiques, consultez un savant qualifié.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NikahAdvisor;
