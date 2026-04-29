import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#111827' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#6b7280', marginBottom: 20 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 2,
    fontWeight: 'bold',
    color: '#374151',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  col1: { flex: 2 },
  col2: { flex: 1, textAlign: 'right' },
  footer: { marginTop: 24, fontSize: 9, color: '#9ca3af', textAlign: 'center' },
})

function InventoryPDF({ products }: { products: { name: string; category: string; price: number; stock: number }[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Reporte de Inventario</Text>
        <Text style={styles.subtitle}>
          Generado el {new Date().toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Text>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Producto</Text>
          <Text style={styles.col1}>Categoría</Text>
          <Text style={styles.col2}>Precio</Text>
          <Text style={styles.col2}>Stock</Text>
        </View>
        {products.map((p, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.col1}>{p.name}</Text>
            <Text style={styles.col1}>{p.category}</Text>
            <Text style={styles.col2}>${p.price.toFixed(2)}</Text>
            <Text style={styles.col2}>{p.stock}</Text>
          </View>
        ))}
        <Text style={styles.footer}>Total: {products.length} productos</Text>
      </Page>
    </Document>
  )
}

function SalesPDF({ sales }: { sales: { product: string; quantity: number; total: number; date: string }[] }) {
  const grandTotal = sales.reduce((sum, s) => sum + s.total, 0)
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Reporte de Ventas</Text>
        <Text style={styles.subtitle}>
          Generado el {new Date().toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })}
        </Text>
        <View style={styles.tableHeader}>
          <Text style={styles.col1}>Producto</Text>
          <Text style={styles.col2}>Cant.</Text>
          <Text style={styles.col2}>Total</Text>
          <Text style={styles.col2}>Fecha</Text>
        </View>
        {sales.map((s, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.col1}>{s.product}</Text>
            <Text style={styles.col2}>{s.quantity}</Text>
            <Text style={styles.col2}>${s.total.toFixed(2)}</Text>
            <Text style={styles.col2}>{s.date}</Text>
          </View>
        ))}
        <Text style={styles.footer}>Total recaudado: ${grandTotal.toFixed(2)}</Text>
      </Page>
    </Document>
  )
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') ?? 'csv'
  const type = searchParams.get('type') ?? 'inventory'
  const userId = session.user.id

  if (type === 'inventory') {
    const products = await prisma.product.findMany({
      where: { userId, deletedAt: null },
      include: { category: { select: { name: true } } },
      orderBy: { name: 'asc' },
    })

    if (format === 'csv') {
      const rows = [
        'Nombre,Descripción,Precio,Stock,Categoría',
        ...products.map((p) =>
          [
            `"${p.name}"`,
            `"${p.description ?? ''}"`,
            p.price.toFixed(2),
            p.stock,
            `"${p.category?.name ?? ''}"`,
          ].join(',')
        ),
      ].join('\n')
      return new NextResponse(rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="inventario.csv"',
        },
      })
    }

    if (format === 'pdf') {
      const data = products.map((p) => ({
        name: p.name,
        category: p.category?.name ?? '—',
        price: p.price,
        stock: p.stock,
      }))
      const buffer = await renderToBuffer(<InventoryPDF products={data} />)
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="inventario.pdf"',
        },
      })
    }
  }

  if (type === 'sales') {
    const sales = await prisma.sale.findMany({
      where: { userId },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    if (format === 'csv') {
      const rows = [
        'Producto,Cantidad,Total,Fecha',
        ...sales.map((s) =>
          [
            `"${s.product.name}"`,
            s.quantity,
            s.total.toFixed(2),
            s.createdAt.toISOString().split('T')[0],
          ].join(',')
        ),
      ].join('\n')
      return new NextResponse(rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="ventas.csv"',
        },
      })
    }

    if (format === 'pdf') {
      const data = sales.map((s) => ({
        product: s.product.name,
        quantity: s.quantity,
        total: s.total,
        date: s.createdAt.toLocaleDateString('es'),
      }))
      const buffer = await renderToBuffer(<SalesPDF sales={data} />)
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="ventas.pdf"',
        },
      })
    }
  }

  return NextResponse.json({ error: 'Formato o tipo no soportado' }, { status: 400 })
}
