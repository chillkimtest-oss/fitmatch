import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <span className="text-lg font-bold tracking-tight">FitMatch</span>
        <Link
          href="/quiz"
          className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 active:opacity-80"
        >
          Find Your Trainer
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center md:py-32">
        <span className="mb-5 inline-block rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Toronto Personal Trainers
        </span>
        <h1 className="mb-5 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          Find the trainer that&apos;s built for{' '}
          <span className="text-zinc-400">you</span>.
        </h1>
        <p className="mb-10 max-w-xl text-base leading-relaxed text-zinc-500 md:text-lg">
          Answer 6 quick questions and we&apos;ll match you with Toronto personal
          trainers who fit your goals, style, and schedule — no guessing.
        </p>
        <Link
          href="/quiz"
          className="rounded-2xl bg-zinc-900 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-zinc-700 active:scale-[0.98]"
        >
          Find Your Trainer →
        </Link>
        <p className="mt-4 text-sm text-zinc-400">Free · Takes 60 seconds</p>
      </section>

      {/* How It Works */}
      <section className="bg-zinc-50 px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-center text-2xl font-bold md:text-3xl">
            How It Works
          </h2>
          <p className="mb-12 text-center text-sm text-zinc-500">
            Three steps to your perfect match
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Take the Quiz',
                body: 'Tell us your fitness goals, preferred training style, and how you like to be coached.',
              },
              {
                step: '02',
                title: 'Get Matched',
                body: 'Our algorithm scores 30 real Toronto trainers against your answers and ranks your top picks.',
              },
              {
                step: '03',
                title: 'Start Training',
                body: 'Browse your matched trainers, visit their profiles, and reach out to begin your journey.',
              },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="rounded-2xl border-2 border-zinc-100 bg-white p-6"
              >
                <span className="mb-3 block text-xs font-bold tracking-widest text-zinc-300">
                  {step}
                </span>
                <h3 className="mb-2 text-base font-bold">{title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FitMatch */}
      <section className="px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-center text-2xl font-bold md:text-3xl">
            Why FitMatch
          </h2>
          <p className="mb-12 text-center text-sm text-zinc-500">
            Smarter matching, better results
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: '🎯',
                title: 'Precision Matching',
                body: 'We score trainers across 5 dimensions — not just location and price — so your match actually fits.',
              },
              {
                icon: '🏙️',
                title: 'Toronto-Only',
                body: 'Every trainer in our database is local to Toronto, with verified specialties and real profiles.',
              },
              {
                icon: '⚡',
                title: 'Done in 60 Seconds',
                body: 'No account needed. No email wall. Just answer 6 questions and see your results instantly.',
              },
              {
                icon: '🔒',
                title: 'No Pressure',
                body: 'We surface the trainers; you decide if and when to reach out. Zero spam, zero obligation.',
              },
            ].map(({ icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border-2 border-zinc-100 p-6"
              >
                <span className="mb-3 block text-2xl">{icon}</span>
                <h3 className="mb-1.5 text-base font-bold">{title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-zinc-900 px-6 py-14 text-center text-white md:py-16">
        <h2 className="mb-3 text-2xl font-bold md:text-3xl">
          Ready to find your trainer?
        </h2>
        <p className="mb-8 text-sm text-zinc-400">
          Join others who found their perfect fitness match in minutes.
        </p>
        <Link
          href="/quiz"
          className="inline-block rounded-2xl bg-white px-8 py-4 text-base font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 active:scale-[0.98]"
        >
          Find Your Trainer →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 px-6 py-8 md:px-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <span className="text-sm font-bold text-zinc-900">FitMatch</span>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-400">
            <a href="#" className="hover:text-zinc-900">About</a>
            <a href="#" className="hover:text-zinc-900">For Trainers</a>
            <a href="#" className="hover:text-zinc-900">Privacy</a>
            <a href="#" className="hover:text-zinc-900">Terms</a>
            <a href="#" className="hover:text-zinc-900">Contact</a>
          </nav>
          <span className="text-xs text-zinc-300">© 2026 FitMatch</span>
        </div>
      </footer>
    </div>
  );
}
