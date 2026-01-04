# Callisto - A Not So Intelligent Progress Tracker

A Next.js application for tracking your learning journey with AI-powered roadmap generation.

## Run Locally

**Prerequisites:** Node.js 18+ 

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory and add your API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   MONGODB_URI=your_mongodb_atlas_connection_string
   ```
   
   To get your MongoDB Atlas connection string:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Click "Connect" → "Connect your application"
   - Copy the connection string and replace `<password>` with your database password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/callisto?retryWrites=true&w=majority`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Features

- 📊 Dashboard with progress tracking and visualizations
- 📚 Category-based organization of learning goals
- 🎯 AI-powered roadmap generation using Gemini
- ✅ Topic and subtopic tracking with progress indicators
- 📝 Notes and comments for each learning item
- 🎨 Modern, responsive UI built with Tailwind CSS
