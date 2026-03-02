'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const calmingPrompts = [
  "Je suis inquiet pour l'avenir...",
  "Comment rester calme dans ces temps incertains ?",
  "J'ai peur de la guerre...",
  "Aide-moi à relativiser",
  "J'ai besoin de réconfort",
];

// ============ SURVIVAL GUIDE DATA ============
interface GuideItem {
  title: string;
  icon: string;
  content: string[];
  tips: string[];
}

const survivalGuides: Record<string, GuideItem> = {
  fire: {
    title: "Faire un Feu",
    icon: "🔥",
    content: [
      "Savoir faire du feu est une compétence essentielle de survie. Le feu fournit chaleur, lumière, possibilité de cuisiner, et un morale boost.",
    ],
    tips: [
      "🔥 MÉTHODES D'ALLUMAGE",
      "• Allumettes/briquet - Gardez-les au sec dans un contenant étanche",
      "• Briquet ferro-cérium - Fonctionne même mouillé, 3000 étincelles",
      "• Lunettes/loupes - Concentrez les rayons du soleil sur du combustible sec",
      "• Frottement (arc à feu) - Nécessite pratique, bois sec et persévérance",
      "",
      "📦 MATÉRIAUX NÉCESSAIRES",
      "• Amorce: herbe sèche, écorce de bouleau, coton, papier",
      "• Petit bois: brindilles fines, éclats de bois",
      "• Combustible: bûches, branches mortes d'arbres résineux",
      "",
      "⚡ ÉTAPES CLÉS",
      "1. Préparez un espace dégagé, loin des feuilles mortes",
      "2. Creusez un petit trou ou faites un cercle de pierres",
      "3. Empilez l'amorce au centre, entourez de petit bois en tipi",
      "4. Allumez l'amorce, soufflez doucement",
      "5. Ajoutez progressivement du combustible plus gros",
      "",
      "⚠️ SÉCURITÉ",
      "• Ne jamais laisser un feu sans surveillance",
      "• Gardez de l'eau ou du sable près pour l'éteindre",
      "• Éteignez complètement avant de partir (eau + brassage)",
    ],
  },
  shelter: {
    title: "Se Loger / S'abriter",
    icon: "🏠",
    content: [
      "Un abri protège du froid, de la pluie, du vent et des regards. C'est la priorité #1 en situation de survie.",
    ],
    tips: [
      "🏘️ EN VILLE / EN GUERRE",
      "• Abris officiels: souterrains, métros, caves désignées",
      "• Bâtiments abandonnés: évitez les étages élevés",
      "• Intérieurs: restez loin des fenêtres, pièce centrale",
      "• Signalez votre présence si nécessaire aux autorités",
      "",
      "🌲 EN NATURE",
      "• Abri naturel: grotte (vérifiez les habitants!), arbre tombé",
      "• Abri de fortune: branches + feuilles + neige/mousse",
      "• Tarp/Bâche: le plus polyvalent, facile à transporter",
      "• Trou dans la neige: isole très bien du froid",
      "",
      "📐 CONSTRUCTION D'ABRI",
      "1. Choisissez un terrain plat, sec, à l'abri du vent",
      "2. Évitez les zones d'écoulement d'eau ou d'avalanche",
      "3. Construisez juste assez grand pour votre corps + équipement",
      "4. Isolez le sol: branches, feuilles, mousse (10cm min)",
      "5. Toit incliné pour l'écoulement de l'eau",
      "",
      "💡 CONSEILS IMPORTANTS",
      "• Restez visible pour les sauveteurs si possible",
      "• Prévoyez une sortie de secours",
      "• Ne bouchez pas complètement l'aération",
    ],
  },
  water: {
    title: "Eau Potable",
    icon: "💧",
    content: [
      "L'être humain ne peut survivre que 3 jours sans eau. C'est la priorité absolue après l'abri.",
    ],
    tips: [
      "🔍 TROUVER DE L'EAU",
      "• Ruisseaux, rivières (l'eau courante est souvent meilleure)",
      "• Pluie: utilisez bâches, feuilles larges, récipients",
      "• Rosée: tissu sur l'herbe au matin, essorez",
      "• Neige: faites-la fondre (ne jamais manger de la neige direct)",
      "• Végétaux: bambou, cactus, lianes (selon région)",
      "",
      "🧪 PURIFICATION",
      "• Ébullition: 1 minute (3 min en altitude) - le plus sûr",
      "• Pastilles: Micropur, Aquatabs (à garder dans le kit)",
      "• Filtre portable: LifeStraw, Sawyer (investissement utile)",
      "• Eau de javel: 2 gouttes par litre, attendre 30 min",
      "• DIY: sable + charbon + gravier dans une bouteille",
      "",
      "⚠️ SIGNES D'EAU DANGEREUSE",
      "• Couleur étrange ou odeur",
      "• Présence d'animaux morts près de la source",
      "• Déchets ou pollution en amont",
      "",
      "📊 CONSOMMATION",
      "• Minimum: 2 litres/jour (plus si activité/chaleur)",
      "• Buvez par petites gorgées régulièrement",
      "• Réduisez l'activité aux heures chaudes",
    ],
  },
  food: {
    title: "Se Nourrir",
    icon: "🍖",
    content: [
      "On peut survivre 3 semaines sans nourriture, mais l'énergie est cruciale pour prendre de bonnes décisions.",
    ],
    tips: [
      "🍌 EN VILLE / SITUATION D'URGENCE",
      "• Constituez des réserves: conserves, riz, pâtes (longue conservation)",
      "• Avoir au moins 3 jours de nourriture chez soi",
      "• Économisez: mangez d'abord les aliments frais périssables",
      "• Partagez avec vos proches et voisins si possible",
      "",
      "🌿 EN NATURE - PLANTES COMESTIBLES",
      "• Ortie: riche en fer, cuisiner comme épinards",
      "• Pissenlit: tout est comestible, jeune = meilleur goût",
      "• Trèfle: fleurs et feuilles crues ou cuites",
      "• Plantain: feuilles jeunes en salade",
      "• Champignons: ATTENTION - ne mangez que si certain à 100%",
      "",
      "🐟 PROTÉINES",
      "• Poisson: hameçon + fil, pièges simples",
      "• Insectes: grillons, sauterelles, vers (bien cuits)",
      "• Oeufs: nids au sol ou dans les arbres",
      "• Petit gibier: pièges à lacet (nécessite pratique)",
      "",
      "❌ NE JAMAIS MANGER",
      "• Plantes au latex blanc",
      "• Plantes à poils urticants non identifiées",
      "• Baies blanches ou jaunes (souvent toxiques)",
      "• Plantes aux feuilles en 3 (ressemblant au lierre)",
    ],
  },
  firstaid: {
    title: "Premiers Secours",
    icon: "🏥",
    content: [
      "Connaître les bases des premiers secours peut sauver des vies. Restez calme et agissez méthodiquement.",
    ],
    tips: [
      "🎒 KIT DE PREMIERS SECOURS MINIMUM",
      "• Bandages élastiques et compresses",
      "• Désinfectant (Bétadine ou alcool)",
      "• Pansements adhésifs de différentes tailles",
      "• Ciseaux, pince à épiler",
      "• Gants en latex",
      "• Médicaments: antalgiques, antidiarrhéiques",
      "",
      "🩸 HÉMORRAGIE",
      "1. Exercez une pression directe avec un tissu propre",
      "2. Maintenez la pression 10-15 min sans relâcher",
      "3. Élevez le membre si possible",
      "4. Si ça ne s'arrête pas: garrot (dernier recours)",
      "",
      "🫁 RÉANIMATION (RCP)",
      "1. Vérifiez la conscience: secouez, appelez",
      "2. Ouvrez les voies aériennes: basculez la tête",
      "3. Vérifiez la respiration (10 sec max)",
      "4. Si pas de respiration: 30 compressions + 2 souffles",
      "5. Continuez jusqu'à l'arrivée des secours",
      "",
      "🤒 CHOC ET HYPOTHERMIE",
      "• Allongez la personne, jambes surélevées",
      "• Couvrez avec tout ce qui peut isoler",
      "• Ne réchauffez pas trop vite (risque d'arrêt cardiaque)",
      "• Restez avec la personne, parlez-lui",
    ],
  },
  emergency: {
    title: "Situation de Guerre",
    icon: "⚠️",
    content: [
      "En cas de conflit armé, la préparation et le sang-froid sont vos meilleurs atouts. Voici les consignes essentielles.",
    ],
    tips: [
      "📋 PRÉPARATION AVANT",
      "• Documents: passeport, papiers d'identité dans un sac étanche",
      "• Kit d'évacuation: prêt à partir en 15 min",
      "• Argent liquide et copies de clés en plusieurs endroits",
      "• Plan de famille: point de rendez-vous, contacts d'urgence",
      "• Connaître les abris les plus proches de chez vous",
      "",
      "🚨 ALERTES ET CONFINEMENT",
      "• Suivez les instructions officielles (radio, apps gouvernementales)",
      "• En cas d'alerte: abri souterrain ou pièce centrale",
      "• Restez loin des fenêtres et portes vitrées",
      "• Préparez eau, nourriture, lampe, radio",
      "",
      "🚶 ÉVACUATION",
      "• N'évacuez que sur ordre officiel ou danger imminent",
      "• Prenez: documents, médicaments, eau, nourriture, argent",
      "• Empruntez les itinéraires officiels",
      "• Informez quelqu'un de votre destination",
      "",
      "📞 CONTACTS IMPORTANTS",
      "• 112: Numéro d'urgence européen",
      "• 114: Numéro d'urgence pour personnes sourdes/malentendantes",
      "• Croix-Rouge: informations et aide",
      "• Mairie/Prefecture: consignes locales",
      "",
      "💡 CONSEILS PSYCHOLOGIQUES",
      "• Restez connecté avec vos proches",
      "• Maintenez une routine si possible",
      "• Limitez l'exposition aux nouvelles anxiogènes",
      "• Aidez les autres si vous le pouvez - ça aide aussi",
    ],
  },
  kit: {
    title: "Kit de Survie",
    icon: "🎒",
    content: [
      "Un kit de survie bien préparé peut faire toute la différence. Voici ce qu'il devrait contenir.",
    ],
    tips: [
      "🎒 SAC D'ÉVACUATION (72H)",
      "",
      "💧 EAU ET NOURRITURE",
      "• 3 litres d'eau minimum",
      "• Nourriture non périssable (barres énergétiques, conserves)",
      "• Ouvre-boîte manuel",
      "• Gobelet en métal",
      "",
      "🛏️ ABRIS ET CHALEUR",
      "• Sac de couchage ou couverture de survie",
      "• Bâche légère (2x3m minimum)",
      "• Corde (paracorde 15-30m)",
      "• Allumettes étanches + briquer ferro",
      "",
      "🔧 OUTILS",
      "• Couteau solide ou multi-tool",
      "• Lampe frontale + piles de rechange",
      "• Sifflet (signal de détresse)",
      "• Radio à manivelle/solaire",
      "",
      "🩺 SANTÉ ET HYGIÈNE",
      "• Trousse de premiers secours complète",
      "• Médicaments personnels (7 jours)",
      "• Masques N95",
      "• Lingettes, savon, désinfectant mains",
      "",
      "📄 DOCUMENTS",
      "• Copies de papiers d'identité",
      "• Informations médicales importantes",
      "• Liste de contacts d'urgence",
      "• Argent liquide (petites coupures)",
      "",
      "📱 COMMUNICATION",
      "• Téléphone + chargeur portable",
      "• Batterie externe solaire",
      "",
      "🎒 Gardez ce sac accessible et vérifiez-le tous les 6 mois",
    ],
  },
};

const guideCategories = Object.keys(survivalGuides);

// ============ MAIN COMPONENT ============
export default function SerenityApp() {
  const [activeTab, setActiveTab] = useState<'chat' | 'guide'>('chat');
  const [selectedGuide, setSelectedGuide] = useState<string>('emergency');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowWelcome(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "Je suis là pour vous écouter. Parlez-moi de ce qui vous préoccupe.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Je rencontre un petit problème technique, mais je reste à votre écoute. N'hésitez pas à reformuler votre pensée.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Ambient background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-breathe" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-calm-lavender/5 blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-calm-blue/3 blur-3xl animate-breathe" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 md:px-6 py-4 border-b border-border/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-calm-lavender flex items-center justify-center">
              <svg className="w-5 h-5 text-background" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-semibold gradient-text">Serenity</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Réconfort & Préparation</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-card/50 rounded-full p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
                activeTab === 'chat' 
                  ? 'bg-primary text-background' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
                activeTab === 'guide' 
                  ? 'bg-primary text-background' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              📚 Guide
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-hidden">
        
        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            {/* Welcome Screen */}
            {showWelcome && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-calm-lavender/20 flex items-center justify-center mb-6 animate-gentle-float">
                  <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                
                <h2 className="text-2xl font-semibold text-center mb-2">
                  Bienvenue dans votre espace serein
                </h2>
                <p className="text-muted-foreground text-center max-w-md mb-8">
                  Les temps sont incertains, mais vous n'êtes pas seul. 
                  Je suis là pour vous écouter et vous aider à retrouver le calme.
                </p>

                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {calmingPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handlePromptClick(prompt)}
                      className="px-4 py-2 rounded-full bg-card/80 border border-border/50 text-sm text-foreground/80 hover:bg-card hover:border-primary/30 hover:text-foreground transition-smooth"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {!showWelcome && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className={`max-w-[85%] md:max-w-[70%] ${
                      message.role === 'user' 
                        ? 'message-user rounded-2xl rounded-br-md' 
                        : 'message-ai rounded-2xl rounded-bl-md'
                    } px-4 py-3`}>
                      <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className="text-xs text-foreground/50 mt-2">
                        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="message-ai rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-muted-foreground">Je réfléchis...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}

        {/* GUIDE TAB */}
        {activeTab === 'guide' && (
          <div className="max-w-4xl mx-auto h-full flex flex-col md:flex-row p-4 gap-4">
            
            {/* Guide Navigation */}
            <div className="md:w-64 flex-shrink-0">
              <div className="bg-card/50 rounded-2xl border border-border/50 p-3">
                <h3 className="text-sm font-medium text-muted-foreground mb-3 px-2">Catégories</h3>
                <div className="space-y-1">
                  {guideCategories.map((key) => {
                    const guide = survivalGuides[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedGuide(key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-smooth ${
                          selectedGuide === key 
                            ? 'bg-primary/20 text-primary border border-primary/30' 
                            : 'hover:bg-card text-foreground/80'
                        }`}
                      >
                        <span className="text-lg">{guide.icon}</span>
                        <span className="text-sm font-medium">{guide.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Guide Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="bg-card/30 rounded-2xl border border-border/50 p-6">
                {selectedGuide && survivalGuides[selectedGuide] && (
                  <div className="animate-fade-in">
                    {/* Guide Header */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border/30">
                      <span className="text-3xl">{survivalGuides[selectedGuide].icon}</span>
                      <div>
                        <h2 className="text-xl font-semibold">{survivalGuides[selectedGuide].title}</h2>
                        <p className="text-sm text-muted-foreground">{survivalGuides[selectedGuide].content}</p>
                      </div>
                    </div>

                    {/* Guide Tips */}
                    <div className="space-y-1 text-sm leading-relaxed">
                      {survivalGuides[selectedGuide].tips.map((tip, index) => {
                        // Check if it's a header (contains emoji or uppercase with special chars)
                        const isHeader = /^[\p{Emoji}]/u.test(tip) || (tip === tip.toUpperCase() && tip.length > 3 && tip.includes(' '));
                        const isSubHeader = tip.startsWith('•') && tip.includes(':') && tip.split(':')[0].length < 30;
                        
                        if (tip === '') {
                          return <div key={index} className="h-3" />;
                        }
                        
                        if (isHeader && !tip.startsWith('•')) {
                          return (
                            <h3 key={index} className="font-semibold text-primary pt-4 first:pt-0">
                              {tip}
                            </h3>
                          );
                        }
                        
                        return (
                          <p key={index} className={`text-foreground/80 ${tip.startsWith('•') ? 'pl-2' : ''}`}>
                            {tip}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Input Area - Only show for chat tab */}
      {activeTab === 'chat' && (
        <footer className="relative z-10 border-t border-border/50 p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Exprimez-vous... je suis là pour vous écouter"
                  rows={1}
                  className="w-full resize-none rounded-2xl bg-card border border-border/50 px-4 py-3 text-sm md:text-base focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-smooth min-h-[48px] max-h-32"
                  style={{ height: 'auto' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-calm-lavender text-background flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary/20 transition-smooth"
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Vos conversations sont privées et confidentielles
            </p>
          </form>
        </footer>
      )}
    </div>
  );
}
