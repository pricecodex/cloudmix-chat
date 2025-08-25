## Tech Stack

- Next.js
- TypeScript
- AWS
- Google Gemini
- Tailwind CSS
- Jest
- Zod

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```sh
git clone https://github.com/pricecodex/cloudmix-chat.git
cd cloudmix-chat
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Environment Variables

You need to create a .env file. Use the provided .env.example as a template.

```sh
# AWS common
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# AWS WS
AWS_API_GATEWAY_ENDPOINT=
AWS_API_GATEWAY_ID=

# Client AWS
NEXT_PUBLIC_AWS_API_GATEWAY_ID=
NEXT_PUBLIC_AWS_REGION=
NEXT_PUBLIC_AWS_API_STAGE=

# Gemini
GEMINI_API_KEY=

# TZ
TZ=UTC
```

### 4. Run the Dev Server

```sh
npm run dev
```

### 5. Run Tests

```sh
npm run test
```
