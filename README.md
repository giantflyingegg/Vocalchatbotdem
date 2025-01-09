# Voice Chat Assistant

A Next.js application that enables voice-based conversations with an AI assistant using OpenAI's Whisper for speech-to-text and Claude for generating responses.

## Features

- Voice recording with a 5-second time limit
- Real-time recording countdown
- Speech-to-text conversion using OpenAI's Whisper API
- AI responses powered by Anthropic's Claude
- Modern chat interface with message history

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Anthropic API key

## Environment Variables

Create a `.env.local` file with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/giantflyingegg/Vocalchatbotdem.git
cd Vocalchatbotdem
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- OpenAI Whisper API
- Anthropic Claude API
- Web Audio API

## License

MIT
