import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex justify-between items-center">
            <Link to="/" className="subtitle text-black">
              HustleMap
            </Link>
            <div className="flex items-center gap-4 sm:gap-6">
              <a
                href="#features"
                className="text-black body-text hover:underline"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-black body-text hover:underline"
              >
                How it Works
              </a>
              <Link
                to="/login"
                className="text-black body-text hover:underline"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 form-label border border-black text-black hover:bg-black hover:text-white"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <h1 className="page-title text-black mb-4">
          Track your job applications and learn from interviews.
        </h1>
        <p className="subtitle text-black mb-6 max-w-2xl mx-auto">
          Manage applications, track status, rate interview difficulty (1–5),
          and log real questions by round. Build your Interview Summary to
          improve with each interview.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/register"
            className="px-4 py-2 border border-black text-black hover:bg-black hover:text-white"
          >
            Start Using
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-black hover:underline"
          >
            View GitHub
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-black text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="page-title mb-8 text-center">Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="subtitle mb-2">Track Applications</h3>
              <p className="helper-text text-gray-300">
                Keep track of all your job applications with status updates and
                notes.
              </p>
            </div>
            <div>
              <h3 className="subtitle mb-2">Interview Summary & History</h3>
              <p className="helper-text text-gray-300">
                Log interview difficulty and real questions asked in each round.
                Review past interviews to improve performance and prepare smarter.
              </p>
            </div>
            <div>
              <h3 className="subtitle mb-2">View Analytics</h3>
              <p className="helper-text text-gray-300">
                See simple analytics about your application progress and trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interview Summary Features */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="page-title mb-6 text-center text-black">
            Learn from Every Interview
          </h2>
          <p className="subtitle text-center text-black mb-8 max-w-2xl mx-auto">
            Build a structured Interview Summary with difficulty ratings and
            real questions. Reflect on your experiences to improve with each
            interview.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Preparation Notes */}
            <div className="bg-white border border-black p-4">
              <div className="text-2xl mb-3">📝</div>
              <h3 className="subtitle mb-3 text-black">Preparation Notes</h3>
              <p className="helper-text text-gray-700 mb-3">
                Store everything you need before an interview in one place:
              </p>
              <ul className="space-y-1.5 helper-text text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>Company background & culture</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>Technical topics to revise</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>Behavioral questions to practice</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>Salary expectations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>Questions to ask the interviewer</span>
                </li>
              </ul>
            </div>

            {/* Interview Difficulty Rating */}
            <div className="bg-white border border-black p-4">
              <div className="text-2xl mb-3">⭐</div>
              <h3 className="subtitle mb-3 text-black">Difficulty Rating</h3>
              <p className="helper-text text-gray-700 mb-3">
                Rate each interview round from 1 (Easy) to 5 (Very Hard) to:
              </p>
              <ul className="space-y-1.5 helper-text text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>Quickly assess your experiences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>Compare interview difficulty levels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>Identify patterns in your interviews</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>Prepare better for future rounds</span>
                </li>
              </ul>
            </div>

            {/* Interview Summary & History */}
            <div className="bg-white border border-black p-4">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="subtitle mb-3 text-black">
                Interview Summary & History
              </h3>
              <p className="helper-text text-gray-700 mb-3">
                Log interview difficulty and real questions asked in each round.
                Review past interviews to improve performance and prepare smarter:
              </p>
              <ul className="space-y-1.5 helper-text text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>
                    Rate difficulty (1–5) to track interview complexity
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>
                    Log questions by round (Technical Round 1, HR, etc.)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>Add your notes or answers for each question</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-black">•</span>
                  <span>
                    Review past Interview Summaries to identify patterns
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="subtitle text-black mb-4">
              Build your Interview Summary with each interview. Learn from past
              experiences, identify improvement areas, and prepare smarter for
              your next opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="page-title mb-8 text-center">How It Works</h2>
          <div className="space-y-6">
            <div className="border-l-2 border-black pl-4">
              <h3 className="subtitle mb-1.5">1. Sign up</h3>
              <p className="helper-text text-black">
                Create an account to get started. It only takes a minute.
              </p>
            </div>
            <div className="border-l-2 border-black pl-4">
              <h3 className="subtitle mb-1.5">2. Add applications</h3>
              <p className="helper-text text-black">
                Start adding your job applications with company name, position,
                and status.
              </p>
            </div>
            <div className="border-l-2 border-black pl-4">
              <h3 className="subtitle mb-1.5">3. Track progress & build Interview Summary</h3>
              <p className="helper-text text-black">
                Update status as you move through interviews. Rate difficulty,
                log questions by round, and build your Interview Summary to
                learn and improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="bg-black text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="page-title mb-3">Ready to get started?</h2>
          <p className="helper-text text-gray-300 mb-6">
            Start tracking your job applications and building your Interview
            Summary today.
          </p>
          <Link
            to="/register"
            className="inline-block px-4 py-2 border border-white text-white hover:bg-white hover:text-black"
          >
            Sign up
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 helper-text text-black">
            <div>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHub
              </a>
            </div>
            <div className="text-black">
              Built with React, Node.js, Express, MongoDB
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
