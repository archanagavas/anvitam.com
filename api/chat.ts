import type { VercelRequest, VercelResponse } from '@vercel/node';

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY || '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';

const SYSTEM_PROMPT = `You are Archana's AI Assistant for Anvitam (anvitam.com), a leading sustainable & biophilic architectural design studio based in Nadiad/Vadodara, Gujarat, India, led by Principal Architect Ar. Archana Gavas.

YOUR GOAL:
1. Speak naturally and warmly in whatever language the visitor speaks (English, Hinglish, Hindi, Gujarati, etc.).
2. Answer questions accurately based on Anvitam's actual services, workshops, project portfolio, and pricing.
3. Be concise, human, empathetic, and professional (keep replies under 3-4 sentences).
4. Actively guide visitors to use the Cost Estimator, book a 1:1 consultation, or leave their Name and WhatsApp/Email.

COMPANY KNOWLEDGE BASE:
- Services: Farmhouse & Weekend Homes, Eco-Resort & Farmstay Masterplanning, Food Forest & Permaculture Layouts, Landscape & Rainwater Harvesting Design.
- Nest N Nurture Workshops: Bird House Making, Space Makeovers, Upcycling & Plastic Transformation for schools, colleges & offices.
- Cost Estimator: We have a live on-screen Cost Estimator tool for instant budget calculation.
- Contact: Studio in Nadiad, Gujarat. Phone +91 7990657190. Email ar.archanagavas@gmail.com.
- Consultations: 1:1 online sessions available via Topmate.
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, userQuery } = req.body || {};

    if (!userQuery && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const payloadMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(messages || []),
      ...(userQuery ? [{ role: 'user', content: userQuery }] : [])
    ];

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: payloadMessages,
        temperature: 0.5,
        max_tokens: 512,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[NVIDIA API Error]:', response.status, errText);
      return res.status(500).json({ error: 'AI provider error', details: errText });
    }

    const data = await response.json();
    const replyText = data.choices?.[0]?.message?.content || "Namaste! How can I assist you with your eco-resort or farmhouse project today?";

    return res.status(200).json({ reply: replyText });
  } catch (error: any) {
    console.error('[Chat API Handler Exception]:', error);
    return res.status(500).json({ error: 'Internal server error', message: error.message });
  }
}
