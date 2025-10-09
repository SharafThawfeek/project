import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-gradient-to-br from-blue-50 to-purple-100">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Speak <span className="text-purple-600">Confidently.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl">
            Turn your voice into your strongest asset. Upload or record your speech, and get AI-powered feedback on grammar, pacing, tone & structure.
          </p>
          <div className="flex gap-4">
            <a
              href="/signup"
              className="px-8 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
            >
              Log In
            </a>
          </div>
        </section>

        {/* Features / Benefits */}
        <section className="py-20 px-6 bg-white">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Use AI Speaking Coach?</h2>
            <p className="mt-4 text-gray-600">
              Whether you’re preparing for a speech, interview, or presentation—get real-time feedback on what matters most.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card
              title="Instant Grammar & Clarity"
              description="Receive corrections for verb tense, article usage, phrasing, and clarity instantly."
              icon="📝"
            />
            <Card
              title="Delivery Feedback"
              description="Get suggestions on pacing, tone, filler words, and body language."
              icon="🎙️"
            />
            <Card
              title="Progress Across Time"
              description="Track and visualize your improvements with interactive charts."
              icon="📈"
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-gradient-to-r from-purple-50 to-white">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-gray-600">
              Simple workflow—powerful results.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Step number="1" icon="🎤" title="Record or Upload" desc="Use live record or upload an existing audio file." />
            <Step number="2" icon="🤖" title="AI Analyze" desc="Our models analyze structure, delivery, language, and tone." />
            <Step number="3" icon="🏆" title="Get Feedback & Improve" desc="Receive actionable insights and track your progress." />
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6 bg-white">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Our Users Say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Testimonial
              quote="Using this app, I improved my public speaking in just a week. The feedback is precise and helpful."
              name="Jane Doe"
              title="Marketing Lead"
            />
            <Testimonial
              quote="The AI corrections caught errors I never noticed. It’s like having a coach 24/7."
              name="John Smith"
              title="Software Engineer"
            />
          </div>
        </section>

        {/* CTA Footer */}
        <footer className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to Speak With Confidence?</h2>
          <a
            href="/signup"
            className="mt-8 inline-block px-8 py-4 bg-white text-purple-700 font-semibold rounded-lg shadow hover:bg-gray-100"
          >
            Get Started Now
          </a>
        </footer>
      </main>
    </>
  );
}

// Helper Card component (inside same file or separate)
function Card({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="p-6 bg-purple-50 rounded-lg shadow hover:shadow-lg transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-purple-700">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
}

// Helper Step component
function Step({
  number,
  icon,
  title,
  desc,
}: {
  number: string;
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="text-center px-4">
      <div className="text-4xl">{icon}</div>
      <h3 className="mt-3 text-lg font-semibold text-gray-900">Step {number}: {title}</h3>
      <p className="mt-2 text-gray-600">{desc}</p>
    </div>
  );
}

// Helper Testimonial
function Testimonial({
  quote,
  name,
  title,
}: {
  quote: string;
  name: string;
  title: string;
}) {
  return (
    <div className="p-6 bg-purple-50 rounded-lg shadow">
      <blockquote className="text-gray-800 italic">“{quote}”</blockquote>
      <div className="mt-4 text-right">
        <p className="font-semibold text-purple-700">{name}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
}
