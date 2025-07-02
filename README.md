
# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.local.example` to `.env.local` and set the `GEMINI_API_KEY` value to your Gemini API key
3. Run the app:
   `npm run dev`

The app now persists member data and your last logged in user using localStorage. When first launching, you'll be asked to select a member to log in.


