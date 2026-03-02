import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Tu es Serenity, un assistant bienveillant et empathique spécialisé dans le soutien émotionnel et le réconfort.

## Ton identité
- Tu es chaleureux, doux et compréhensif
- Tu parles avec calme et sérénité
- Tu ne juges jamais, tu accueilles toutes les émotions
- Tu es là pour écouter, rassurer et apporter une perspective apaisante

## Ta mission
Aider les personnes qui traversent des moments d'incertitude, d'anxiété ou de peur face à:
- La situation mondiale (conflits, crises, changements)
- L'avenir incertain
- Les difficultés personnelles
- Le stress et l'anxiété générale

## Réponds toujours avec:
1. Validation des émotions ("C'est tout à fait compréhensible...")
2. Perspective rassurante
3. Conseils pratiques ou techniques de calme
4. Note d'espoir

Utilise le "vous", réponds en français, sois concis mais chaleureux.`;

// Intelligent fallback responses
const FALLBACK_RESPONSES: Record<string, string> = {
  guerre: `Je comprends tout à fait votre peur. La situation mondiale actuelle est source de beaucoup d'anxiété.

Voici quelques pensées pour vous aider :

• **Vous n'êtes pas seul** - Beaucoup de personnes partagent ces inquiétudes
• **Restez informé mais sans excès** - Limitez votre consommation d'actualités à 1-2 fois par jour
• **Préparez-vous concrètement** - Consultez notre Guide pour des conseils pratiques
• **Restez connecté** - Parlez avec vos proches, le soutien mutuel est essentiel

Prenez le temps de respirer profondément. Un pas à la fois.`,

  information: `C'est tout à fait normal de se sentir perdu face à la multiplication des sources d'information.

**Comment s'y retrouver :**

📰 **Diversifiez vos sources**
• Consultez 2-3 médias de bords différents
• Comparez les versions d'un même événement
• Méfiez-vous des titres sensationnalistes

🔍 **Vérifiez avant de croire**
• Les faits se vérifient, les opinions se discutent
• Une info qui joue sur l'émotion est souvent biaisée
• Les sources officielles (gouvernement, ONU, Croix-Rouge) sont plus fiables

⏰ **Limitez votre exposition**
• Fixez-vous des moments pour l'actualité (pas en continu)
• Évitez les réseaux sociaux comme source principale

🧘 **Recentrez-vous**
• Ce que vous contrôlez : vos actions, votre entourage
• Ce que vous ne contrôlez pas : les décisions des dirigeants

Quelle information vous trouble particulièrement en ce moment ?`,

  peur: `Votre peur est légitime et je suis là pour vous écouter.

Face à l'incertitude, essayez ceci :

🫁 **Respiration apaisante**
• Inspirez par le nez sur 4 secondes
• Retenez 4 secondes
• Expirez lentement par la bouche sur 6 secondes
• Répétez 3 à 5 fois

🦶 **Ancrage au présent**
• 5 choses que vous voyez
• 4 choses que vous entendez
• 3 choses que vous pouvez toucher

Cette technique ramène votre esprit au moment présent.

Qu'est-ce qui vous préoccupe le plus en ce moment ?`,

  avenir: `L'avenir peut sembler effrayant quand tout est incertain. Mais rappelez-vous :

• **Vous avez déjà traversé des moments difficiles** - Et vous êtes toujours là
• **Vous avez plus de ressources que vous ne le pensez** - Résilience, créativité, entourage
• **Chaque jour est une opportunité** - Un petit pas à la fois

🎯 **Concentrez-vous sur ce que vous pouvez contrôler :**
- Votre préparation (voir notre Guide)
- Vos relations proches
- Vos actions quotidiennes

💭 **Lâchez ce qui échappe à votre contrôle :**
- Les décisions politiques
- Les conflits internationaux
- Les opinions des autres

Comment puis-je vous aider à vous sentir plus serein aujourd'hui ?`,

  calme: `Pour retrouver le calme dans ces temps incertains :

🧘 **Technique d'ancrage** : 
Nommez 5 choses que vous voyez, 4 que vous entendez, 3 que vous pouvez toucher

📱 **Déconnexion** : 
Éloignez-vous des écrans 1h avant de dormir

🚶 **Mouvement** :
Une courte marche de 15 min aide à évacuer le stress

💬 **Expression** :
Parler de ses peurs aide à les démystifier

🌊 **Acceptation** :
"Il est normal d'être inquiet. Je fais de mon mieux."

Quel aspect vous semble le plus réalisable aujourd'hui ?`,

  seul: `Vous n'êtes pas seul dans ce que vous ressentez.

Beaucoup de personnes traversent les mêmes inquiétudes :
• Peur de l'avenir
• Confusion face aux informations
• Sentiment d'impuissance

🤝 **Se connecter aide :**
• Parlez à un proche de vos inquiétudes
• Rejoignez des groupes de soutien (en ligne ou présentiels)
• Consultez notre Guide pour des actions concrètes

📞 **Si vous vous sentez submergé :**
• Fil Santé Écoute : 0 800 235 236 (gratuit)
• SOS Amitié : 09 72 39 40 50

Qu'est-ce qui pourrait vous aider à vous sentir moins seul(e) ?`,

  president: `Les décisions politiques peuvent être source d'inquiétude, c'est compréhensible.

⚠️ **Ce qu'il faut retenir :**
• Les citoyens ont le droit de s'informer et de s'exprimer
• La démocratie offre des canaux pour faire entendre sa voix
• L'engagement citoyen existe (associations, mouvements, vote)

🎯 **Actions à votre portée :**
• Restez informé via des sources diversifiées
• Participez au débat public si vous le souhaitez
• Préparez-vous et protégez vos proches (voir Guide)

Vous n'êtes pas responsable des décisions politiques, mais vous pouvez agir à votre niveau.

Qu'est-ce qui vous préoccupe le plus dans l'actualité récente ?`,

  default: `Je comprends que vous traversiez un moment difficile. Vos émotions sont tout à fait légitimes.

Dans ces moments d'incertitude, rappelez-vous :

• **Respirez** - Quelques respirations profondes peuvent calmer l'esprit
• **Ancrez-vous** - Revenez au moment présent
• **Agissez** - De petites actions concrètes aident à reprendre contrôle

💡 Consultez notre section **Guide** pour des conseils pratiques de préparation.

N'hésitez pas à me dire ce qui vous préoccupe spécifiquement - je suis là pour vous écouter.`
};

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for keywords in order of specificity
  if (lowerMessage.includes('contradictoire') || lowerMessage.includes('information') || lowerMessage.includes('menti') || lowerMessage.includes('vrai') || lowerMessage.includes('faux') || lowerMessage.includes('mensonge') || lowerMessage.includes('croire') || lowerMessage.includes('source')) {
    return FALLBACK_RESPONSES.information;
  }
  if (lowerMessage.includes('guerre') || lowerMessage.includes('conflit') || lowerMessage.includes('attaque') || lowerMessage.includes('bomb') || lowerMessage.includes('armée')) {
    return FALLBACK_RESPONSES.guerre;
  }
  if (lowerMessage.includes('président') || lowerMessage.includes('macron') || lowerMessage.includes('gouvernement') || lowerMessage.includes('politique') || lowerMessage.includes('décision')) {
    return FALLBACK_RESPONSES.president;
  }
  if (lowerMessage.includes('peur') || lowerMessage.includes('effray') || lowerMessage.includes('angoisse') || lowerMessage.includes('anxieux') || lowerMessage.includes('panique')) {
    return FALLBACK_RESPONSES.peur;
  }
  if (lowerMessage.includes('avenir') || lowerMessage.includes('demain') || lowerMessage.includes('futur') || lowerMessage.includes('après')) {
    return FALLBACK_RESPONSES.avenir;
  }
  if (lowerMessage.includes('calm') || lowerMessage.includes('repos') || lowerMessage.includes('détendre') || lowerMessage.includes('stress') || lowerMessage.includes('anxiété') || lowerMessage.includes('apaiser')) {
    return FALLBACK_RESPONSES.calme;
  }
  if (lowerMessage.includes('seul') || lowerMessage.includes('isolé') || lowerMessage.includes('personne') || lowerMessage.includes('comprends pas')) {
    return FALLBACK_RESPONSES.seul;
  }
  
  return FALLBACK_RESPONSES.default;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { response: "Je n'ai pas bien compris votre message. Pouvez-vous reformuler ?" }
      );
    }

    // Try to use AI SDK
    try {
      const zai = await ZAI.create();

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: SYSTEM_PROMPT }
      ];

      if (Array.isArray(history) && history.length > 0) {
        for (const m of history) {
          if (m && typeof m.role === 'string' && typeof m.content === 'string') {
            messages.push({
              role: m.role as 'user' | 'assistant',
              content: m.content
            });
          }
        }
      }

      messages.push({ role: 'user', content: message });

      const completion = await zai.chat.completions.create({
        messages,
        temperature: 0.8,
        max_tokens: 500,
      });

      const responseContent = completion.choices?.[0]?.message?.content;

      if (responseContent && responseContent.trim()) {
        return NextResponse.json({ response: responseContent });
      }
    } catch (aiError) {
      console.error('AI SDK error:', aiError);
      // Fall through to fallback response
    }

    // Fallback to predefined responses
    const fallbackResponse = getFallbackResponse(message);
    return NextResponse.json({ response: fallbackResponse });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { response: "Je suis là pour vous écouter. Parlez-moi de ce qui vous préoccupe." }
    );
  }
}
