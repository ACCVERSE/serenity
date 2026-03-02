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

// Fallback responses for when AI is unavailable
const FALLBACK_RESPONSES: Record<string, string> = {
  guerre: `Je comprends tout à fait votre peur. La situation mondiale actuelle est source de beaucoup d'anxiété, et c'est une réaction parfaitement normale.

Voici quelques pensées pour vous aider :

• **Vous n'êtes pas seul** - Beaucoup de personnes partagent ces inquiétudes
• **Restez informé mais sans excès** - Limitez votre consommation d'actualités anxiogènes
• **Préparez-vous concrètement** - Consultez notre Guide pour des conseils pratiques (kit de survie, contacts d'urgence)
• **Restez connecté** - Parlez avec vos proches, le soutien mutuel est essentiel

Prenez le temps de respirer profondément. Un pas à la fois.`,
  
  peur: `Votre peur est légitime et je suis là pour vous écouter.

Face à l'incertitude, essayez ceci :
• Inspirez profondément par le nez sur 4 secondes
• Retenez 4 secondes
• Expirez lentement par la bouche sur 6 secondes
• Répétez 3 fois

Cette technique de respiration aide à calmer le système nerveux.

Qu'est-ce qui vous préoccupe le plus en ce moment ?`,
  
  avenir: `L'avenir peut sembler effrayant quand tout est incertain. Mais rappelez-vous :

• Vous avez déjà traversé des moments difficiles
• Vous avez plus de ressources que vous ne le pensez
• Chaque jour est une nouvelle opportunité de faire un petit pas

Concentrez-vous sur ce que vous pouvez contrôler aujourd'hui, pas sur ce qui pourrait arriver demain.

Comment puis-je vous aider davantage ?`,
  
  calm: `Pour retrouver le calme dans ces temps incertains :

🧘 **Technique d'ancrage** : 
Nommez 5 choses que vous voyez, 4 que vous entendez, 3 que vous pouvez toucher

📱 **Déconnexion** : 
Éloignez-vous des écrans 30 min avant de dormir

🚶 **Mouvement** :
Une courte marche peut aider à évacuer le stress

💬 **Expression** :
Parler de ses peurs aide à les démystifier

Quel aspect vous semble le plus réalisable aujourd'hui ?`,

  default: `Je suis là pour vous écouter et vous soutenir.

Ces temps sont incertains et il est normal de ressentir de l'anxiété. Vos émotions sont valides.

N'hésitez pas à me dire ce qui vous préoccupe spécifiquement - je suis là pour vous aider à y voir plus clair.

Vous pouvez aussi consulter notre section **Guide** pour des conseils pratiques de préparation.`
};

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('guerre') || lowerMessage.includes('conflit') || lowerMessage.includes('attaque')) {
    return FALLBACK_RESPONSES.guerre;
  }
  if (lowerMessage.includes('peur') || lowerMessage.includes('effray') || lowerMessage.includes('angoisse')) {
    return FALLBACK_RESPONSES.peur;
  }
  if (lowerMessage.includes('avenir') || lowerMessage.includes('demain') || lowerMessage.includes('futur')) {
    return FALLBACK_RESPONSES.avenir;
  }
  if (lowerMessage.includes('calm') || lowerMessage.includes('repos') || lowerMessage.includes('détendre') || lowerMessage.includes('stress')) {
    return FALLBACK_RESPONSES.calm;
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
      { response: "Je suis là pour vous écouter. Parlez-moi de ce qui vous préoccupe, je suis là pour vous soutenir." }
    );
  }
}
