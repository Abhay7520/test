# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/592be76c-f0ac-4fcb-a093-a58d1030bc16

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/592be76c-f0ac-4fcb-a093-a58d1030bc16) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Key Technologies Used For AI Detection

| Component | Technology |
| --- | --- |
| Frontend | React + TypeScript |
| Image Capture | HTML5 File Input with `capture="environment"` |
| Image Processing | FileReader API → Base64 |
| Backend | Supabase Edge Function (Deno) |
| AI Vision | Lovable AI Gateway → Google Gemini 2.5 Flash |
| API Key | LOVABLE_API_KEY (auto-configured) |

### Detection Features Implementation Pattern
This same pattern is used for all three detection features:
- **Thermometer**: Detects temperature + unit (°F/°C)
- **Blood Pressure**: Detects systolic, diastolic, pulse
- **Glucose**: Detects glucose level + unit (mg/dL or mmol/L)

- **Glucose**: Detects glucose level + unit (mg/dL or mmol/L)

### Architecture Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend as React Component (Frontend)
    participant Backend as Supabase Edge Function (Backend)
    participant Gemini as Google Gemini API (Direct)

    User->>Frontend: Takes photo or uploads image
    Frontend->>Frontend: Compress Image (max 1024px)
    Frontend->>Frontend: Convert to Base64
    Frontend->>Backend: supabase.functions.invoke('detect-glucose', {image: base64})
    Backend->>Gemini: POST https://generativelanguage.googleapis.com/...
    Note right of Backend: Using GEMINI_API_KEY (Direct)
    Gemini-->>Backend: Return Generated Content (JSON)
    Backend-->>Frontend: Return JSON: {glucose: 120, unit: "mg/dL"}
    Frontend->>User: Display reading with category
```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/592be76c-f0ac-4fcb-a093-a58d1030bc16) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
