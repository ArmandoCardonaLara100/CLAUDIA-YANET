# PsiConnect

Portal de práctica psicológica para **Claudia Yanet Lara Gómez** — sitio público + portal privado (terapeuta/paciente) con expediente clínico, intercambio de archivos y actualizaciones en tiempo real.

Reescritura del proyecto original (Express + Socket.IO + JSON + Vite) sobre un stack moderno desplegable en Vercel.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Supabase Postgres** vía **Drizzle ORM**
- **Supabase Realtime** (reemplaza Socket.IO) — scoping por RLS con JWT por usuario
- **Supabase Storage** (buckets privados + URLs firmadas) — reemplaza multer/disco local
- **Auth.js v5** (credenciales usuario/contraseña + bcrypt, sesión JWT, roles `admin`/`patient`)

## Arquitectura

- Las rutas de Express son ahora **Server Actions** en `app/actions/*`, cada una valida sesión/rol con zod (`lib/dal.ts`).
- Lecturas en `lib/queries.ts`; las páginas (server components) hidratan los dashboards cliente.
- Archivos: el navegador sube **directo a Supabase** mediante una URL firmada (evita el límite de cuerpo de Vercel); la descarga usa URLs firmadas de corta duración.
- Realtime: `RealtimeProvider` obtiene un JWT compatible con Supabase (`app/actions/realtime.ts`) y lo aplica al cliente; las suscripciones (`hooks/use-realtime.ts`) reciben cambios filtrados por RLS.

## Puesta en marcha

### 1. Crear proyecto en Supabase

Crea un proyecto en [supabase.com](https://supabase.com) y toma nota de las claves (Settings → API y Settings → Database).

### 2. Variables de entorno

```bash
cp .env.example .env.local
```

Rellena `.env.local`:

| Variable | Dónde |
| --- | --- |
| `DATABASE_URL` | Database → Connection string → **Transaction** pooler (puerto 6543) |
| `DIRECT_URL` | Database → Connection string → **Direct** (puerto 5432) — para migraciones |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXT_PUBLIC_SUPABASE_URL` | API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | API → service_role (¡secreto!) |
| `SUPABASE_JWT_SECRET` | API → JWT Settings → JWT Secret |

### 3. Migrar el esquema

```bash
npm install
npm run db:migrate     # aplica drizzle/*.sql a Supabase
```

### 4. Habilitar Realtime, RLS y Storage

Ejecuta `supabase/policies.sql` en el **SQL Editor** de Supabase (crea los buckets privados, habilita RLS, define las políticas de SELECT para Realtime y agrega las tablas a la publicación).

### 5. (Opcional) Importar datos del proyecto anterior

Migra los usuarios, expedientes y archivos de `../server/db.json` (los hashes bcrypt se conservan, así que los logins existentes siguen funcionando):

```bash
npm run import
```

### 6. Desarrollo

```bash
npm run dev          # http://localhost:3000
```

Credenciales sembradas en el proyecto original: `Claudia / Clau123` (admin), `Armando / Armando123` (paciente).

## Comandos

| Comando | Acción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm run start` | Build y arranque de producción |
| `npm run db:generate` | Genera SQL de migración desde el esquema Drizzle |
| `npm run db:migrate` | Aplica migraciones |
| `npm run db:studio` | Drizzle Studio |
| `npm run import` | Importa `../server/db.json` a Supabase |

## Deploy en Vercel

1. Sube el repo a GitHub e impórtalo en Vercel.
2. Carga todas las variables de `.env.local` en **Project → Settings → Environment Variables** (usa el pooler para `DATABASE_URL`).
3. Deploy. Las migraciones y `policies.sql` se corren contra Supabase (una vez), no en el build de Vercel.
