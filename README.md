# Interview Sensei Frontend

This repository contains the frontend for **Interview Sensei**, an AI-powered interview preparation application. The frontend is built with **Next.js**, styled with **Tailwind CSS**, and interacts with the backend via API endpoints. It provides an intuitive interface for users to upload resumes, generate interview questions, record answers, and receive AI-generated feedback.

## Features
- **AI-powered question generation** based on user-uploaded resumes and job descriptions
- **User authentication & session management**
- **Interview recording and playback**
- **AI-generated feedback on recorded answers**
- **Modern, responsive UI with Tailwind CSS**
- **Seamless integration with the .NET backend**

## Tech Stack
- **Frontend Framework:** Next.js
- **Styling:** Tailwind CSS
- **State Management:** React Hooks/Context API
- **API Communication:** RESTful API (backend hosted on AWS)

## Setup

### Prerequisites
- Node.js installed
- A backend instance running (refer to the backend README)
- Environment variables configured

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/Kyle-Hasan/interview-sensei-frontend.git
   cd interview-sensei-frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_API_URL=your_backend_api_url
   NEXT_PUBLIC_SIGNED_URLS=true
   ```

4. Run the application locally:
   ```sh
   npm run dev
   ```

## Notes
- The frontend relies on the backend being available. If the backend (hosted on AWS free tier) is down, some features may not work.
- If the link is unavailable, please refer to the provided video for an overview of the application's functionality.

## License
This project is licensed under the MIT License.

---

