import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { auth } from '@/lib/auth'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are allowed.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image must be under 5 MB.' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${crypto.randomUUID()}.${ext}`
  const userDir = path.join(process.cwd(), 'public', 'uploads', 'recipe-images', session.user.id)

  await mkdir(userDir, { recursive: true })

  const bytes = new Uint8Array(await file.arrayBuffer())
  await writeFile(path.join(userDir, filename), bytes)

  const publicUrl = `/uploads/recipe-images/${session.user.id}/${filename}`
  return NextResponse.json({ url: publicUrl })
}
