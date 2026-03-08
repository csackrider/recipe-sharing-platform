export default function RecipesLoading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-1 h-4 w-12 animate-pulse rounded bg-zinc-200" />
          <div className="h-7 w-36 animate-pulse rounded bg-zinc-200" />
          <div className="mt-1 h-4 w-48 animate-pulse rounded bg-zinc-200" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 h-24 w-full animate-pulse rounded-lg bg-zinc-100" />
              <div className="mb-2 flex gap-1.5">
                <div className="h-4 w-14 animate-pulse rounded-full bg-zinc-100" />
                <div className="h-4 w-10 animate-pulse rounded-full bg-zinc-100" />
              </div>
              <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
              <div className="flex gap-3">
                <div className="h-3.5 w-12 animate-pulse rounded bg-zinc-100" />
                <div className="h-3.5 w-16 animate-pulse rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
