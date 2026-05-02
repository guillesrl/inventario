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
- React PDF

## Funcionalidades

- Autenticación con Google o magic link por email
- Dashboard con estadísticas: productos, valor de inventario, ventas totales y alertas
- Gestión de productos con búsqueda y filtro por categoría, paginación y soft-delete
- Importación de productos desde CSV (crea o actualiza existentes)
- Categorías con subcategorías (1 nivel de profundidad) y contador de productos
- Registro de ventas con historial, filtro por rango de fechas y paginación
- Alertas automáticas de stock bajo con página dedicada para marcarlas como resueltas
- Reportes con gráfico de top 5 productos más vendidos
- Exportación de reportes en CSV y PDF (inventario y ventas)
- Loading skeletons en todas las rutas del dashboard
- Dark mode por defecto

## Variables de entorno

Crea un archivo `.env` con:

```env
DATABASE_URL=postgresql://...pooler.neon.tech/neondb?sslmode=verify-full
DIRECT_URL=postgresql://...neon.tech/neondb?sslmode=verify-full

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
