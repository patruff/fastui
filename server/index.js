import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate ephemeral token for Realtime API WebRTC connection
app.get('/api/realtime/token', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview',
        voice: 'alloy',
        instructions: `You are a UI builder assistant. The user will describe UI components they want to build using their voice.

Your job is to:
1. Listen to their description of what UI they want
2. Respond conversationally confirming what you'll build
3. Call the "generate_ui" function with the component description

Keep responses short and conversational. After understanding what they want, immediately call the generate_ui function.

Examples of things users might say:
- "Create a login form with email and password"
- "Add a navigation bar at the top"
- "Make a card with an image and some text"
- "Build a pricing table with three tiers"`,
        tools: [
          {
            type: 'function',
            name: 'generate_ui',
            description: 'Generate a UI component based on the user description. Call this whenever the user describes a UI they want to build.',
            parameters: {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  description: 'Detailed description of the UI component to generate',
                },
                component_type: {
                  type: 'string',
                  enum: ['form', 'navigation', 'card', 'layout', 'table', 'list', 'hero', 'modal', 'button', 'other'],
                  description: 'The type of UI component',
                },
              },
              required: ['description', 'component_type'],
            },
          },
          {
            type: 'function',
            name: 'modify_ui',
            description: 'Modify an existing UI component. Call this when the user wants to change something about the current UI.',
            parameters: {
              type: 'object',
              properties: {
                modification: {
                  type: 'string',
                  description: 'What to change about the current UI',
                },
                target_element: {
                  type: 'string',
                  description: 'Which element to modify (if specified)',
                },
              },
              required: ['modification'],
            },
          },
        ],
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error creating realtime session:', error);
    res.status(500).json({ error: 'Failed to create realtime session' });
  }
});

// Generate UI code from a description (called when realtime function call triggers)
app.post('/api/generate-ui', async (req, res) => {
  try {
    const { description, componentType, currentCode } = req.body;

    const systemPrompt = `You are a UI code generator. Generate clean, modern HTML with inline Tailwind CSS classes.

Rules:
- Output ONLY the HTML code, no explanations or markdown
- Use Tailwind CSS utility classes for all styling
- Make it mobile-responsive by default
- Use modern, clean design with good spacing and typography
- Include placeholder content that matches the description
- Use semantic HTML elements
- Make interactive elements look clickable (hover states, cursors)
- Use a cohesive color scheme (indigo/violet primary, gray neutrals)
- Add data-component-id attributes to major elements for click selection

${currentCode ? `The current UI code is:\n${currentCode}\n\nIncorporate the new component into the existing layout.` : 'Start fresh with this component.'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate a ${componentType || 'UI'} component: ${description}`,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const code = completion.choices[0].message.content
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    res.json({ code });
  } catch (error) {
    console.error('Error generating UI:', error);
    res.status(500).json({ error: 'Failed to generate UI' });
  }
});

// Modify existing UI code
app.post('/api/modify-ui', async (req, res) => {
  try {
    const { currentCode, modification, targetElement } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a UI code modifier. You receive existing HTML with Tailwind CSS and a modification request.

Rules:
- Output ONLY the modified HTML code, no explanations or markdown
- Keep all existing elements unless explicitly asked to remove them
- Maintain the same coding style (Tailwind CSS classes)
- Preserve data-component-id attributes
- Make minimal changes to achieve the requested modification`,
        },
        {
          role: 'user',
          content: `Current code:\n${currentCode}\n\nModification: ${modification}${targetElement ? `\nTarget element: ${targetElement}` : ''}`,
        },
      ],
      max_tokens: 4000,
      temperature: 0.5,
    });

    const code = completion.choices[0].message.content
      .replace(/```html\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    res.json({ code });
  } catch (error) {
    console.error('Error modifying UI:', error);
    res.status(500).json({ error: 'Failed to modify UI' });
  }
});

// Serve static files in production
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, '..', 'client', 'dist')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Voice UI Builder server running on port ${PORT}`);
});
