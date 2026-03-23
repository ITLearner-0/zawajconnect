import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Moon, Send, BookOpen, Heart, Sparkles, Star, MessageCircle,
  Clock, ChevronRight, RotateCcw, Lightbulb
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const suggestedTopics = [
  { icon: Heart, label: "Comment savoir si c'est la bonne personne ?", category: 'guidance' },
  { icon: Moon, label: "Comment faire la prière d'Istikharah ?", category: 'prayer' },
  { icon: BookOpen, label: "Que dit le Coran sur le choix du conjoint ?", category: 'quran' },
  { icon: Star, label: "Les signes après une Istikharah", category: 'signs' },
  { icon: Lightbulb, label: "J'hésite entre deux prétendants", category: 'decision' },
  { icon: MessageCircle, label: "Quand impliquer la famille ?", category: 'family' },
];

const assistantResponses: Record<string, string> = {
  prayer: `**La prière d'Istikharah (صلاة الاستخارة)**

C'est une sunnah recommandée quand on fait face à une décision importante, comme le mariage.

**Comment la faire :**
1. Faites vos ablutions (wudu)
2. Priez 2 rak'at surérogatoires
3. Après le salam, récitez le du'a de l'Istikharah avec sincérité

**Le du'a :**
*« Allâhumma innî astakhîruka bi 'ilmika wa astaqdiruka bi qudratika wa as-aluka min fadlika-l-'azîm... »*

**Important :**
- Mentionnez votre besoin spécifique dans le du'a
- Soyez sincère et ouvert au résultat
- Vous pouvez la répéter plusieurs jours
- Le résultat vient par une facilitation ou un obstacle, pas nécessairement par un rêve

*Qu'Allah vous guide vers le meilleur choix. Ameen.*`,

  guidance: `**Comment savoir si c'est la bonne personne ?**

En Islam, plusieurs critères vous guident :

🌙 **La religion et le caractère (dîn et khuluq)** — Le Prophète ﷺ a dit : *« On épouse une femme pour quatre choses : sa richesse, sa lignée, sa beauté et sa religion. Choisis celle qui a la religion. »* (Bukhârî & Muslim)

📋 **Les signes positifs :**
- Vous vous sentez en paix (sakina) avec cette personne
- Votre famille approuve
- La personne vous rapproche d'Allah
- Les portes s'ouvrent naturellement
- Vous partagez des valeurs fondamentales

⚠️ **Les signaux d'alerte :**
- Sentiment de malaise persistant
- Pression de la part de l'autre
- Incompatibilité sur les fondamentaux (religion, enfants, famille)
- L'entourage de confiance vous met en garde

**Mon conseil :** Faites l'Istikharah, consultez vos proches de confiance, et fiez-vous à la combinaison de la raison et du cœur. Allah guide celui qui Lui demande sincèrement.`,

  quran: `**Ce que dit le Coran sur le choix du conjoint**

📖 **Sourate Ar-Rûm (30:21) :**
*« Et parmi Ses signes, Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles et Il a mis entre vous de l'affection et de la bonté. »*

Ce verset nous enseigne 3 piliers du mariage :
1. **As-Sakîna** (tranquillité) — Vous sentez-vous en paix ?
2. **Al-Mawadda** (affection) — Y a-t-il un attachement sincère ?
3. **Ar-Rahma** (miséricorde) — Y a-t-il de la compassion mutuelle ?

📖 **Sourate Al-Baqarah (2:187) :**
*« Elles sont un vêtement pour vous et vous êtes un vêtement pour elles. »*

Le vêtement protège, embellit et couvre les défauts. C'est la métaphore parfaite du couple en Islam.

**Réflexion :** En pensant à cette personne, ressentez-vous ces trois éléments ? C'est un excellent indicateur, en plus de l'Istikharah.`,

  signs: `**Les signes après une Istikharah**

Beaucoup pensent qu'il faut voir un rêve. En réalité, les signes sont souvent plus subtils :

✅ **Signes positifs :**
- Les choses se facilitent naturellement
- Vous ressentez une paix intérieure (sakîna)
- Les obstacles se lèvent
- Les personnes de confiance vous encouragent
- Votre cœur penche vers cette décision

❌ **Signes de détournement :**
- Des obstacles se multiplient
- Un malaise persiste malgré les efforts
- Les gens de bien vous déconseillent
- Des informations négatives émergent
- Votre cœur se détourne

⚠️ **Attention :**
- Ne confondez pas vos désirs avec le résultat de l'Istikharah
- Soyez patient(e), le résultat peut prendre du temps
- Vous pouvez répéter l'Istikharah (7 jours recommandé par certains savants)
- Consultez un savant de confiance si vous avez des doutes

*« Et quiconque place sa confiance en Allah, Il lui suffit. » — Sourate At-Talaq, 65:3*`,

  decision: `**Quand on hésite entre deux prétendants**

C'est une situation fréquente. Voici une approche structurée :

📝 **Étape 1 : Listez vos critères non-négociables**
- Pratique religieuse
- Compatibilité de caractère
- Vision de la famille
- Approbation familiale

📊 **Étape 2 : Évaluez objectivement**
Pour chaque personne, évaluez honnêtement comment elle répond à vos critères essentiels.

🤲 **Étape 3 : Istikharah pour chaque personne**
Faites l'Istikharah séparément pour chaque option et observez les signes.

👨‍👩‍👧 **Étape 4 : Consultez**
- Vos parents
- Un imam de confiance
- Des personnes qui connaissent les deux prétendants

💡 **Rappel important :**
Le "meilleur choix" n'est pas toujours celui qui semble le plus attirant. Le Prophète ﷺ nous a orientés vers la religion et le caractère avant tout.

*Faites confiance au processus. Allah sait ce que vous ne savez pas.*`,

  family: `**Quand impliquer la famille dans la décision ?**

En Islam, la famille joue un rôle central dans le processus de mariage :

📅 **Le bon timing :**
- Après les premiers échanges sérieux (pas au premier contact)
- Quand vous avez un intérêt sincère et mutuel
- Avant de vous attacher émotionnellement
- Idéalement dans les 2-4 premières semaines

👨‍👩‍👧 **Le rôle du Wali (tuteur) :**
Le Prophète ﷺ a dit : *« Pas de mariage sans tuteur. »* (Abu Dawud)
- Le wali protège les intérêts de la personne
- Il apporte une perspective objective
- Il valide la compatibilité familiale

💡 **Conseils pratiques :**
1. Informez vos parents tôt dans le processus
2. Partagez les informations importantes (famille, profession, religion)
3. Organisez une rencontre formelle (khitba)
4. Laissez les familles se connaître
5. N'isolez pas votre décision de votre famille

*Le mariage en Islam est l'union de deux familles, pas seulement de deux individus.*`,
};

const IstikharahAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Assalamu alaykum ! 🌙\n\nJe suis votre assistant Istikharah, ici pour vous guider dans votre réflexion sur le mariage.\n\nJe peux vous aider avec :\n- La prière d'Istikharah et ses conditions\n- Comprendre les signes après l'Istikharah\n- Les critères islamiques du choix du conjoint\n- Les références du Coran et de la Sunnah\n\nQue souhaitez-vous savoir ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Find the best matching response
    const lowerText = messageText.toLowerCase();
    let responseKey = 'guidance';
    if (lowerText.includes('prière') || lowerText.includes('comment faire') || lowerText.includes('istikharah')) responseKey = 'prayer';
    else if (lowerText.includes('coran') || lowerText.includes('sourate') || lowerText.includes('verset')) responseKey = 'quran';
    else if (lowerText.includes('signe') || lowerText.includes('après') || lowerText.includes('rêve')) responseKey = 'signs';
    else if (lowerText.includes('hésite') || lowerText.includes('deux') || lowerText.includes('choix')) responseKey = 'decision';
    else if (lowerText.includes('famille') || lowerText.includes('parent') || lowerText.includes('wali')) responseKey = 'family';

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponses[responseKey],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleTopicClick = (topic: typeof suggestedTopics[0]) => {
    handleSend(topic.label);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="flex flex-col h-[calc(100vh-120px)]">
        {/* Header */}
        <div className="text-center space-y-2 pb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-1" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
            <Moon className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            Assistant Istikharah
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Guidance islamique pour vos décisions de mariage
          </p>
        </div>

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
                    <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>Assistant Istikharah</span>
                  </div>
                )}
                <div className={`text-sm leading-relaxed whitespace-pre-line ${
                  message.role === 'assistant' ? '' : ''
                }`} style={message.role === 'assistant' ? { color: 'var(--color-text-secondary)' } : {}}>
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

        {/* Suggested Topics (show only at beginning) */}
        {messages.length <= 1 && (
          <div className="pb-4">
            <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Sujets suggérés :</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedTopics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <Button
                    key={topic.label}
                    variant="outline"
                    className="h-auto py-2 px-3 text-left justify-start text-xs"
                    style={{ borderColor: 'var(--color-border-default)' }}
                    onClick={() => handleTopicClick(topic)}
                  >
                    <Icon className="h-3.5 w-3.5 mr-2 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span className="line-clamp-2">{topic.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="pt-4" style={{ borderTop: '1px solid var(--color-border-default)' }}>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Posez votre question sur l'Istikharah..."
              className="flex-1"
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
            Cet assistant fournit des informations générales. Pour des situations spécifiques, consultez un savant qualifié.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IstikharahAssistant;
