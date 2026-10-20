SAMVAAD — Learn Indian Sign Language

SAMVAAD is a web-based learning platform designed to support people who want to learn Indian Sign Language (ISL) through structured lessons, video demonstrations, quizzes, and progress tracking.

Project status: MVP / active development
Purpose: Make ISL learning more approachable through an organized, visual, and interactive learning experience.

Table of Contents

The Problem

Our Solution

Goals

Core Features

Who Is It For?

How It Works

Technology Stack

System Architecture

Accessibility and Content Principles

Getting Started

Environment Variables

API and Application Configuration

Deployment

Project Structure

Roadmap

Limitations

Contributing

Acknowledgements and Resources

License

The Problem

Communication can be difficult when Deaf and hard-of-hearing people and people who do not know sign language lack a shared language. Indian Sign Language (ISL) is an important means of communication, but people who want to learn it may face practical barriers, such as:

Scattered learning resources: Beginners may need to search across different websites, videos, and learning materials to find a structured path.

Limited guided practice: Watching a demonstration alone may not provide a clear way to check understanding or revise what was learned.

Lack of immediate feedback: Learners can benefit from quizzes and explanations that help reinforce lesson concepts.

Difficulty tracking learning progress: Without a central learning space, it can be harder to keep track of completed lessons, quiz results, and achievements.

Content management challenges: An educational platform needs a way for administrators to organize courses, lessons, and quizzes as its learning library grows.

These are the problems SAMVAAD aims to address. Their severity and the platform's impact should be evaluated through feedback from learners, Deaf community members, and ISL educators.

Our Solution

SAMVAAD brings learning content and practice into one web application. It is designed to help learners move from a lesson to a quiz and track their progress over time, while allowing administrators to manage educational content.

The initial focus is beginner-friendly ISL learning supported by visual demonstrations, structured courses, quizzes, and progress-related features.

SAMVAAD is intended to support communication and learning. It does not replace qualified ISL instruction, interpreters, or professional accessibility services.

Goals

Organize beginner ISL learning material into courses and lessons.

Pair lessons with quizzes that reinforce the material taught.

Provide learners with a place to review their learning progress.

Give administrators tools to manage learning content.

Build a foundation that can be expanded with reviewed, accurate, and appropriately licensed educational resources.

Keep the interface clear and usable across desktop and mobile screen sizes.

Core Features

Features implemented in the current application include:

Authentication and role-based access: Separate student and administrator experiences.

Course management: Create and manage courses, including category, level, description, thumbnail, and publication status.

Lesson management: Organize lessons by course and order.

Video lessons: Upload lesson videos to Cloudinary and play them through their stored URLs.

Quizzes: Associate quizzes with a course or lesson, provide multiple-choice options, store correct answers, and include explanations.

Student dashboard: A learning entry point for students.

Progress and achievements: Learning progress and achievement-related features.

Admin dashboard: Manage learning content and view platform information.

The exact features available to a user depend on the current implementation and whether the associated content has been published.

Who Is It For?

People beginning to learn Indian Sign Language.

Hearing people who want to improve communication with Deaf people.

Students and educators exploring structured ISL learning resources.

Administrators who need to manage courses, lessons, and quizzes.

The platform is intended to be developed with input from Deaf learners, Deaf community members, and qualified ISL educators.

How It Works

A learner registers or signs in.

The learner opens an available course.

The learner watches its lessons and visual demonstrations.

The learner attempts the associated quiz.

Quiz feedback and available progress features help the learner review their learning.

An administrator manages courses, lessons, quizzes, and publication status.

Technology Stack

Layer

Technology

Role

Frontend

React

User interface

Frontend tooling

Vite

Development server and production build

Backend

Node.js and Express

REST API and application logic

Database

MongoDB Atlas with Mongoose

Store users, courses, lessons, quizzes, and related data

Authentication

JSON Web Tokens (JWT) and role-based authorization

Protect authenticated routes and restrict administrative actions

Video storage

Cloudinary

Store and deliver lesson videos

Development tools

Git, GitHub, VS Code

Version control and development

System Architecture

                    Student / Administrator
                              |
                              v
                    React + Vite Frontend
                              |
                              v
                    Node.js + Express API
                       /            \
                      v              v
              MongoDB Atlas       Cloudinary
              Application data    Lesson videos

The frontend communicates with the backend through API requests. The backend handles authentication, authorization, data operations, and video-upload integration. MongoDB Atlas stores application records, while Cloudinary stores uploaded lesson videos.

Accessibility and Content Principles

SAMVAAD's purpose requires particular care with learning content and accessibility:

Use clear, well-framed visual demonstrations and readable lesson descriptions.

Do not make essential learning information available through audio alone.

Ensure quizzes can be understood without relying on sound.

Use accurate ISL resources reviewed by qualified people wherever possible.

Do not assume that ISL is simply English or Hindi expressed through gestures; sign languages have their own linguistic structure.

Obtain permission or verify the licence before downloading, re-uploading, or redistributing third-party videos.

Seek feedback from Deaf learners and ISL educators and improve the platform based on that feedback.

Any planned features that are not implemented should be treated as future work rather than current capabilities.

Getting Started

Prerequisites

Install the following before running the project locally:

Node.js (a current LTS release is recommended)

npm

Git

A MongoDB Atlas connection string, or another supported MongoDB instance

A Cloudinary account for video uploads

1. Clone the repository

git clone https://github.com/Aneesh-lab/SAMVAAD
cd SAMVAAD

2. Install backend dependencies

cd backend
npm install

Create the backend .env file using the variable names required by the backend configuration. See Environment Variables.

Start the backend using the script defined in backend/package.json. A common development command is:

npm run dev

If the project uses a different script or entry file, follow the actual package.json.

3. Install frontend dependencies

Open a second terminal:

cd frontend
npm install

Create the frontend environment file if the application requires one. Set the API base URL to your local backend address according to the existing frontend configuration.

Start the frontend using:

npm run dev

Vite will print the local URL in the terminal. Open that URL in your browser.

Note: The exact environment variable names and commands must match the repository's current configuration. Do not commit .env files or credentials to GitHub.

Environment Variables

Configure environment variables in the appropriate environment. Names below are examples of the configuration typically needed; verify them against the actual backend and frontend source before use.

Backend

Variable

Purpose

PORT

Port used by the backend server; the deployment host may provide this automatically.

MONGODB_URI

MongoDB connection string, if this is the name used by the application.

JWT_SECRET

Secret used to sign and verify JWTs. Use a strong, private value.

CLOUDINARY_CLOUD_NAME

Cloudinary cloud name.

CLOUDINARY_API_KEY

Cloudinary API key.

CLOUDINARY_API_SECRET

Cloudinary API secret.

The database variable may have a different name in your project. Check the backend's configuration before setting it.

Frontend

If the frontend uses Vite environment variables for the API base URL, they must use the VITE_ prefix, for example:

VITE_API_BASE_URL=https://your-backend-service.example

This is an example only. Use the exact variable name expected by your frontend code. Vite variables prefixed with VITE_ are exposed to the browser bundle; never place secrets in frontend environment variables.

API and Application Configuration

Configure the frontend to send API requests to the deployed backend URL in production.

Configure the backend to accept requests from the intended frontend origin.

Ensure the backend listens on the deployment platform's assigned port.

Keep JWT, database, and Cloudinary secrets on the backend.

Restrict MongoDB Atlas network access appropriately for the deployment.

Use HTTPS for public deployments.

Never store uploaded videos or important application data only on a deployment server's local filesystem.

API route names and available endpoints are defined by the current backend implementation.

Deployment

SAMVAAD can be deployed as separate frontend and backend services:

Frontend: A static-site host that supports Vite builds.

Backend: A Node.js web-service host that supports Express.

Database: The existing MongoDB Atlas deployment.

Video storage: The existing Cloudinary account.

For a Vite frontend, the usual build command is:

npm run build

The output directory is commonly dist, unless the Vite configuration changes it.

The backend build and start commands depend on backend/package.json and the actual server entry point.

Before launch, verify:

Login, registration, logout, and role-based access.

Course and lesson visibility.

Video uploads and playback.

Quiz submission and answer feedback.

Progress and achievements.

Production API URL and CORS settings.

Database connectivity and environment variables.

Error handling when a free backend service is waking from inactivity.

Mobile layout and keyboard-accessible controls.

Free hosting services may sleep or have usage limits. Review the current terms and resource limits of each hosting provider before relying on it for regular student use.

Project Structure

The application is organized into separate frontend and backend areas. The exact structure may vary as development continues.

SAMVAAD/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middleware/
│   ├── package.json
│   └── .env                 # Local only; do not commit
├── frontend/
│   ├── public/
│   ├── src/
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md

This is a representative structure. Keep the README aligned with the repository's actual folders.

Roadmap

Planned improvements may include:

Expanding the library of reviewed ISL courses and lessons.

Adding more course-specific quizzes and learning activities.

Improving accessibility and responsive design based on user testing.

Reviewing content with Deaf community members and qualified ISL educators.

Improving course discovery and learning feedback.

Exploring camera-based sign-practice features only after assessing technical feasibility, privacy, accessibility, and the reliability of recognition.

Limitations

The usefulness of the platform depends on the quality, accuracy, coverage, and licensing of its learning content.

A quiz can reinforce lesson material but cannot, by itself, establish sign-language fluency.

Any sign-recognition or camera-based practice feature is not claimed as available unless implemented and validated.

Availability and response time may depend on the limits of the selected hosting plans.

SAMVAAD is an educational project and should not be represented as a replacement for qualified instruction or interpreting services.

Contributing

Contributions, suggestions, accessibility feedback, and content-review assistance are welcome.

Fork the repository.

Create a branch for your change.

Make and test your changes.

Open a pull request with a clear explanation of the change.

For contributions involving ISL content, include the source and permission or licence information, and seek qualified review before publishing educational material.

Acknowledgements and Resources

Indian Sign Language Research and Training Centre (ISLRTC) — an important starting point for official ISL information and learning resources.

React

Vite

Node.js

Express

MongoDB

Cloudinary