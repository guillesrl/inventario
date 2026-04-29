import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, '').toLowerCase())

  return lines.slice(1).map((line) => {
    const fields: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    fields.push(current.trim())
    return Object.fromEntries(headers.map((h, i) => [h, fields[i] ?? '']))
  })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const userId = session.user.id

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

  const text = await file.text()
  const rows = parseCSV(text)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'El archivo no contiene datos válidos' }, { status: 400 })
  }
  if (rows.length > 500) {
    return NextResponse.json({ error: 'El archivo supera el límite de 500 filas' }, { status: 413 })
  }

  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const row of rows) {
    const name = row['name']?.trim()
    const price = Number(row['price'])
    const stock = Number(row['stock'] ?? '0')

    if (!name || isNaN(price) || isNaN(stock)) {
      results.errors.push(`Fila inválida: ${name ?? '(sin nombre)'}`)
      results.skipped++
      continue
    }

    let categoryId: string | null = null
    if (row['category']?.trim()) {
      const cat = await prisma.category.findFirst({
        where: { userId, name: { equals: row['category'].trim(), mode: 'insensitive' } },
      })
      if (cat) categoryId = cat.id
    }

    try {
      await prisma.product.upsert({
        where: { userId_name: { userId, name } },
        create: {
          name,
          description: row['description']?.trim() || null,
          price,
          stock,
          categoryId,
          userId,
        },
        update: {
          description: row['description']?.trim() || undefined,
          price,
          stock,
          categoryId,
        },
      })
      results.created++
    } catch {
      results.errors.push(`Error al guardar "${name}"`)
      results.skipped++
    }
  }

  return NextResponse.json(results, { status: 201 })
}
