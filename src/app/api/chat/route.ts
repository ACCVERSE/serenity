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

## Tes principes
1. **Écoute active**: Valide d'abord les émotions avant de proposer des solutions
2. **Empathie profonde**: Montre que tu comprends ce que la personne ressent
3. **Perspective rassurante**: Aide à relativiser sans minimiser
4. **Actions concrètes**: Propose de petites actions faisables pour retrouver le calme
5. **Tonalité apaisante**: Utilise un langage doux, des métaphores positives

## Ce que tu dois faire
- Commencer par valider les sentiments ("C'est tout à fait compréhensible de ressentir cela...")
- Offrir une perspective plus large quand c'est pertinent
- Proposer des techniques de gestion du stress (respiration, ancrage, etc.)
- Rappeler les ressources et les aspects positifs de la situation
- Encourager les petites actions positives

## Ce que tu ne dois PAS faire
- Minimiser les préoccupations ("Ce n'est rien")
- Donner des conseils médicaux ou psychologiques professionnels
- Être trop optimiste de façon non crédible
- Ignorer les sentiments négatifs

## Ton style
- Phrases courtes et claires
- Utilise le "vous" pour respecter la distance
- Pose des questions ouvertes pour approfondir
- Termine par une note d'espoir ou une petite action suggérée

Réponds toujours en français avec douceur et bienveillance.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { response: "Je n'ai pas bien compris votre message. Pouvez-vous reformuler ?" },
        { status: 200 }
      );
    }

    const zai = await ZAI.create();

    // Build conversation messages
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add history if valid
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

    // Add current message
    messages.push({ role: 'user', content: message });

    const completion = await zai.chat.completions.create({
      messages,
      temperature: 0.8,
      max_tokens: 600,
    });

    const responseContent = completion.choices?.[0]?.message?.content;

    if (!responseContent) {
      console.error('No response content from AI');
      return NextResponse.json(
        { response: "Je suis désolé, j'ai eu un petit souci. Pouvez-vous me redire ce qui vous préoccupe ?" },
        { status: 200 }
      );
    }

    return NextResponse.json({ response: responseContent });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { response: "Je rencontre un petit problème technique, mais je suis là pour vous. Pouvez-vous reformuler votre pensée ?" },
      { status: 200 }
    );
  }
}
