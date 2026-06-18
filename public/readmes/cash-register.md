# 🏪 Cash Register System

> **Real-world Production Application** | Built in under 8 hours for a village religious event

## 🔗 **Live Demo**

[Cash Register](https://cash-register-a85839.gitlab.io/)

[![Next.js](https://img.shields.io/badge/Next.js-Framework-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-Library-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Language-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=flat-square&logo=supabase)](https://supabase.com/)

---

## 🚀 Project Overview

This application was developed as an urgent solution for a village religious event, that I was participating in, where a cash register software was needed. The entire system was designed, coded, and deployed with a complete database in less than 8 hours, showcasing exceptional development velocity and problem-solving skills.

### Key Achievements
- ⚡ **Rapid Development**: Complete application built in under 8 hours
- 🎯 **Real-world Impact**: Successfully used during multi-day religious event
- 📱 **Mobile-First Design**: Optimized for tablet/mobile use in event environment
- 🔄 **Iterative Improvement**: Continuous user feedback integration during event

## 📱 Application Features

### Cash Register Interface
- **Product Selection**: Visual grid of categorized products (food/beverages)
- **Order Management**: Add/remove items with quantity controls
- **Real-time Totals**: Automatic price calculations
- **Order Confirmation**: Secure order processing with unique IDs
- **Mobile Optimization**: Touch-friendly interface for tablet use

### Order Management
- **Order History**: Card grid with revenue stats and ticket médio
- **Order Details**: Slide-over panel (desktop) or full-page (mobile)
- **Operator Accountability**: Each order records who registered it and which shift

### Operator Sessions
- **PIN login**: Volunteers select their name and enter a 4-digit PIN to start a shift
- **Encerrar Turno**: Ends the shift and clears the session
- Demo PINs (after migration seed): `1234` for Carlos, Maria, João; `5678` for Ana (admin)

### Product Management (admin)
- **`/products` route**: Create and edit menu items (name, price, category, description)
- **Photo upload**: Optional product image via Supabase Storage (`product-images` bucket)
- **Access control**: Admin role required (RPC `upsert_product`)

---

## Data Model

| Table | Purpose |
|-------|---------|
| `products` | Menu items (`id`, `name`, `price`, `category`, optional `image_url`, `description`). Seed catalog: `lib/seed-products.json` → `pnpm seed:generate` → `supabase/seed.sql`. Admins manage products in-app at `/products` via `upsert_product` RPC |
| `orders` | Confirmed orders (`id`, `registered_by`, `shift_id`, timestamps) |
| `order_items` | Line items per order |
| `operators` | Staff accounts (`name`, `pin_hash`, `role`, `active`) |
| `shifts` | Work sessions (`operator_id`, `started_at`, `ended_at`) |

RPC functions: `authenticate_operator`, `list_active_operators`, `start_shift`, `end_shift`.

---

## 🛠️ Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Database operations
pnpm supabase:start
pnpm supabase:stop
pnpm supabase:reset

# Apply migrations to hosted Supabase (required for operator PIN login)
pnpm supabase db push
```


---

## 🔧 Configuration

### Environment Setup

Local Supabase uses custom ports (see `lib/local-supabase.ts`):

| Service | Port |
|---------|------|
| API | 54621 |
| DB | 54622 |
| Studio | 54623 |
| Inbucket | 54624 |

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54621
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
```

After `pnpm supabase:start`, run `pnpm supabase:env-sync` to write `.env.local`, or copy `.env.example`.

### Database Setup
```bash
pnpm supabase:start
pnpm supabase:reset
pnpm supabase:env-sync   # sync .env.local with running instance
pnpm supabase:types
```

Studio: http://127.0.0.1:54623


---

## 🤖 Automated Code Documentation

This project uses an automated code documentation workflow powered by **n8n**:

### Overview
An n8n workflow runs on an Azure VM that automatically analyzes code changes on every push to the repository. The workflow:
- **Triggers on Push**: Automatically runs when code is pushed to the repository
- **Code Analysis**: Scans the codebase for uncommented code sections
- **Comment Generation**: Automatically generates helpful comments based on the code logic
- **Azure VM Deployment**: Runs reliably on a dedicated Azure virtual machine

### Benefits
- 📝 **Consistent Documentation**: Ensures code remains well-documented without manual effort
- 🔄 **Automated Process**: No need to remember to add comments manually
- 🎯 **Quality Assurance**: Helps maintain code quality standards across the project
- ⚡ **Zero Overhead**: Runs in the background without impacting development workflow

This automation helps maintain high code quality and documentation standards throughout the project lifecycle.

---

## 🤝 Contributing

This is a personal portfolio project, but **ideas, issues, and suggestions are always welcome**. Feel free to open an issue or submit a merge request if you see something that could be improved.

---

## 📄 License

This project is for personal portfolio purposes. **All rights reserved.**

---

**Contact**: [LinkedIn](https://www.linkedin.com/in/miguel-louren%C3%A7o-395335355/) · [GitLab](https://gitlab.com/miguel-lourenco-main) · [Email](mailto:migasoulou@gmail.com)

**Built with ❤️ by Miguel Lourenço**