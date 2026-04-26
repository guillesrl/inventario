# ⭐ Inventario SaaS

Sistema de gestión de inventario para pequeñas tiendas. Construido con Next.js 16, Prisma 7 y Neon Postgres.

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4 (dark mode por defecto)
- Prisma 7 con driver adapter pg
- Neon Serverless Postgres
- NextAuth v5 (Google + Email magic link)
- Recharts

## Funcionalidades

- Autenticación con Google o magic link por email
- Dashboard con estadísticas: productos, valor de inventario, ventas totales y alertas
- Gestión de productos con categorías, precio y stock
- Alertas automáticas de stock bajo (≤5 unidades)
- Registro de ventas con historial
- Categorías con contador de productos asignados
- Exportación de reportes en CSV (inventario y ventas)
- Soft-delete en productos
- Dark mode por defecto

## Variables de entorno

Crea un archivo `.env` con:

```env
DATABASE_URL=postgresql://...pooler...
DIRECT_URL=postgresql://...sin-pooler...

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

EMAIL_SERVER=smtp://user:pass@smtp.example.com:587
EMAIL_FROM=noreply@example.com
```

## Instalación

```bash
npm install
npx prisma db push
npm run dev
```

La app corre en [http://localhost:3000](http://localhost:3000).
