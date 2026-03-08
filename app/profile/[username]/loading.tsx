export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside>
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="h-14 w-14 animate-pulse rounded-full bg-zinc-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-zinc-200" />
                  <div className="h-3 w-20 animate-pulse rounded bg-zinc-200" />
                </div>
              </div>
              <div className="mb-4 h-12 animate-pulse rounded-lg bg-zinc-100" />
              <div className="h-16 animate-pulse rounded-lg bg-zinc-100" />
            </div>
          </aside>
          <main>
            <div className="mb-5 h-6 w-40 animate-pulse rounded bg-zinc-200" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl bg-zinc-200" />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
