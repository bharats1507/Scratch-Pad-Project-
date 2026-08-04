# Scratchpad

Scratchpad is a small AI-powered utility app built for students. It takes rough notes, weak draft answers, or a topic name, and turns them into something more usable — a clean summary, a practice quiz, an improved answer, or a plain-language explanation.

## What it does

Scratchpad has four tools, each solving one small, real study problem:

| Tool | Input | Output |
|---|---|---|
| **Summarize Notes** | Raw notes or reading material | A structured summary organized by key point |
| **Generate Quiz** | Notes + desired question count | Practice questions with an answer key |
| **Improve Answer** | A question + your draft answer | A rewritten, stronger answer with a "what changed" breakdown |
| **Explain Concept** | A topic name + your level | A plain-language explanation with a worked example |

## Why it's built this way

Each tool sends a **purpose-built prompt** to the model rather than forwarding raw input to a generic chatbot. For example, the quiz tool doesn't just say "make a quiz" — it explicitly instructs the model on question count, format, and to include an answer key. This is what keeps the output usable instead of a vague, unstructured reply.

The app is split into two parts:

- **Frontend** (`public/index.html`) — a single-file HTML/CSS/JS interface. No frameworks, no build step.
- **Backend** (`server.js`) — a small Express server that holds the API key and forwards requests to the model API.

This split exists for a real reason: browsers can't safely call a third-party AI API directly. Doing so would mean shipping your private API key inside public JavaScript, where anyone viewing the page source could steal it. The backend keeps the key server-side and only exposes a single, narrow endpoint (`/api/generate`) that the frontend is allowed to call.

## How a request flows through the app

1. User picks a tool and fills in the input field(s).
2. On clicking **Generate**, the frontend runs a basic validation check — if the required field is empty, it shows an inline error and never contacts the server.
3. The frontend builds a structured prompt specific to the selected tool and sends it to `POST /api/generate`.
4. The backend attaches the API key, forwards the request to the model API, and waits for a response.
5. If the upstream call fails (bad key, network issue, rate limit, empty response), the backend returns a clear error message instead of crashing.
6. The frontend renders the response as formatted markdown (headings, bullet points, bold text), and also keeps the raw response available via the **View raw** toggle for debugging or demoing.

## Project structure

```
scratchpad-project/
├── public/
│   └── index.html       # Frontend UI (all HTML/CSS/JS in one file)
├── server.js             # Backend proxy server
├── package.json           # Dependencies and start script
├── .env.example            # Template for required environment variables
├── .gitignore
└── README.md
```

## Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later (needed for built-in `fetch`)
- A free Groq API key from [console.groq.com/keys](https://console.groq.com/keys)

### Steps

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd scratchpad-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Open `.env` and add your API key:
   ```
   GROQ_API_KEY=your_api_key_here
   PORT=3000
   ```

4. **Run the app**
   ```bash
   npm start
   ```

5. Open `http://localhost:3000` in your browser.

## Validation and error handling

- **Empty input** — the Generate button is blocked client-side; no request is sent, and an inline message tells the user what's missing.
- **Missing API key on the server** — returns a clear 500 error instead of an unhandled crash.
- **Upstream API failure** (bad key, rate limit, network drop) — caught, logged server-side, and returned to the frontend as a friendly error message rather than a raw stack trace.
- **Empty model response** — treated as a failure case rather than silently rendering a blank result.

## Notes on deployment

If you deploy this (e.g. Render, Railway, Fly.io, a VPS), set `GROQ_API_KEY` as an environment variable in your hosting platform's dashboard — never commit it to the repo. The `.env` file is already excluded via `.gitignore`.

## Limitations

- Output quality depends on the input given — vague notes produce a vague summary.
- Generated content should be checked before submitting anything for a grade; the model can make factual mistakes.
- No persistent storage — nothing you generate is saved between sessions.

## Possible future improvements

- Save/export generated results (PDF, copy-to-clipboard)
- Support for uploading a file instead of pasting text
- Per-tool history within a session
- User accounts to save past generations

