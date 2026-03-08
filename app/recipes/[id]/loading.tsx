export default function RecipeLoading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6 h-4 w-24 animate-pulse rounded bg-zinc-200" />
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-3 flex gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-200" />
            <div className="h-5 w-12 animate-pulse rounded-full bg-zinc-200" />
          </div>
          <div className="mb-2 h-8 w-3/4 animate-pulse rounded bg-zinc-200" />
          <div className="mb-6 flex gap-4">
            <div className="h-4 w-16 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
          </div>
          <hr className="mb-6 border-zinc-100" />
          <div className="mb-6 space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded bg-zinc-100" />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 w-full animate-pulse rounded bg-zinc-100" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
