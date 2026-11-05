import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini SDK with server-side API Key
  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Al Asad Constructors Intelligence Server',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Multi-turn Gemini Chat with Google Maps Grounding endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, userLocation, projectContext } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
      }

      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please verify your API Key in Settings > Secrets.',
        });
      }

      const systemInstruction = `You are "Al Asad Site Intelligence AI" (الاسد سائٹ انٹیلیجنس), the chief digital civil engineer and geospatial logistics copilot for "Al Asad Constructors" (الاسد کنسٹرکٹرز).

Your core duties:
1. Construction Engineering & Site Technical Calculations:
   - Concrete mix proportions (1:2:4 Nominal, 1:1.5:3 RCC, C20, C25, C30, C35 pump mixes), water-cement ratio, slump test interpretation, cube compressive strength.
   - Steel reinforcement estimation (tonnage, cut-and-bend schedules, lap lengths for deformed rebar ASTM A615 Grade 60).
   - Brickwork, plastering, waterproofing membranes, thermal insulation, shuttering stripping periods, curing duration.
2. Geospatial Site Logistics & Google Maps Grounding:
   - Accurately locate nearby Ready-Mix Concrete (RMC) batching plants, cement distribution warehouses (Lucky, Bestway, Fauji, Maple Leaf, DG Khan), sand sources (Chenab, Ravi, Lawrencepur), crush aggregate quarries (Margalla, Sargodha), steel rerolling mills (Mughal, Amreli, Agha), and heavy machinery rentals in Islamabad, Rawalpindi, Lahore, Karachi, Peshawar, and across Pakistan or international job sites.
   - When answering location-based or supply queries, formulate answers that utilize the Google Maps tool and highlight specific places, routes, and physical coordinates.
3. Quality & Snag Management:
   - Defect troubleshooting (honeycombing, cold joints, shrinkage cracks, efflorescence, level discrepancies).
   - OSHA & Pakistan Building Code (PBC) safety checklist, PPE compliance, scaffold safety.
4. Current Active Project Context:
   ${projectContext || 'Al Asad Corporate HQ (Blue Area, Islamabad), Al Asad Commercial Mall (Gulberg III, Lahore), Al Asad Executive Villas (DHA Phase 2, Rawalpindi).'}.

Formatting & Tone:
- Authoritative, polite, clear civil engineering guidance.
- Use crisp Markdown with bullet points, numbered calculation steps, and bold key terms.
- Use bilingual engineering terminology where natural (e.g., Concrete / کنکریٹ, Steel / سریا, Formwork / شٹرنگ).
- Maintain high professional standards worthy of executive construction contractors.`;

      // Format messages into GoogleGenAI contents array
      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.content || m.text || '') }],
      }));

      // Base configuration with tools
      const config: any = {
        systemInstruction,
        tools: [{ googleMaps: {} }],
      };

      // Add userLocation retrievalConfig if provided
      if (
        userLocation &&
        typeof userLocation.latitude === 'number' &&
        typeof userLocation.longitude === 'number'
      ) {
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
          },
        };
      }

      // Generate content with gemini-3.8-flash as required
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config,
      });

      const replyText = response.text || '';
      const groundingChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSearchQueries =
        response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      return res.json({
        text: replyText,
        groundingChunks,
        webSearchQueries,
      });
    } catch (error: any) {
      console.error('Gemini chat error:', error);
      return res.status(500).json({
        error: error.message || 'Failed to process request with Gemini AI',
      });
    }
  });

  // Attach Vite middlewares in dev mode, or serve dist in production
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Al Asad Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Al Asad Server] Failed to start server:', err);
});
