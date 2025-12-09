# 🌐 Miguel Lourenço – Portfolio & CV Website

> **Multilingual Portfolio & CV** | **Full Stack Developer** | **Modern Web Experiences**

## 🔗 Live Demo

[miguel-sousa-lourenco.cv](https://miguel-sousa-lourenco.cv)

[![Next.js](https://img.shields.io/badge/Next.js-14.0.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-Testing-green?style=flat-square&logo=playwright)](https://playwright.dev/)

## 🚀 Project Overview

This repository powers Miguel Lourenço’s personal portfolio and CV website. It showcases professional experience, selected projects, and technical skills in a **fast, animated, multilingual** interface built on top of modern React and Next.js tooling.

The site is designed as a **production-ready personal brand hub**: focused on clarity, performance, accessibility, and maintainability, while still pushing for a polished, delightful user experience.

### Key Highlights

- ⚡ **Modern Stack**: Next.js App Router, React 18, TypeScript, Tailwind CSS
- 🌍 **Multilingual**: English, Portuguese, French, and Spanish
- 🎬 **Rich Micro-Interactions**: Smooth scroll, parallax, and reveal animations
- 📱 **Responsive & Device-Aware**: Optimized for mobile, tablet, and desktop
- 🎨 **Light/Dark Theme**: System-aware theming with manual toggle
- 🔍 **SEO-Ready**: Structured metadata, Open Graph, and localized routes
- 📦 **Static Export**: Can be deployed to any static hosting (GitLab Pages, Vercel, Netlify, etc.)

## 🛠️ Technical Stack

### Frontend

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict type checking
- **UI & Styling**:
  - Tailwind CSS 3 with a small design system and utility helpers
  - Custom components (buttons, cards, layouts) built on top of **Radix UI** primitives
  - Icon sets from **Lucide React** and **Tabler Icons**
- **Animations & Effects**:
  - `motion` for smooth, modern animations
  - `react-scroll-parallax` and custom hooks for scroll-based effects
  - Interactive project and category cards with hover and focus states

### Internationalization

- **Libraries**: `i18next`, `react-i18next`, `next-i18next`, and `i18next-http-backend`
- **Languages**: `en`, `pt`, `fr`, `es`
- **Content Model**:
  - Copy and project descriptions stored as JSON files under `public/locales`
  - All key UI content is translatable, including projects and CTAs
- **Routing & SEO**:
  - Locale-aware routing via `next-i18next`
  - Language-specific metadata for better discoverability

### Content & Data

- **Projects**:
  - Centralized in `app/components/projects/projects.data.ts` with typed models
  - Per-language project details backed by `public/locales/[lang]/projects/*.json`
- **Media & Assets**:
  - SVG and image assets optimized for static export
  - Reusable icons and graphics for identity, categories, and navigation

### Tooling & DX

- **Package Manager**: `pnpm`
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript
- **Styling Tooling**: Tailwind CSS, PostCSS, Autoprefixer

## 📱 Application Sections

### Home & Hero

- **Hero section** with name, role, and strong visual identity
- **Language switcher**, **theme toggle**, and primary CTAs (Projects, Contact)
- Device-aware layout using custom hooks for laptop/mobile detection
- Subtle animation and parallax to create a polished first impression

### About & Skills

- Structured **About** section describing background and focus areas
- Skill categories for **Frontend**, **Backend**, **DevOps**, **Languages**, and **Tooling**
- Rich cards with icons, descriptions, and categorization for quick scanning

### Projects

- Highlighted professional and personal projects, including:
  - **UI Components Playground**
  - **Sonora** (voice-based application)
  - **Agentic Hub** (AI agent marketplace)
  - **Cash Register** (real-world POS system)
- Interactive project cards, carousels, and focus views
- Per-locale descriptions and metadata
- Integration points for external resources (e.g. GitLab READMEs and demos)

## 🤝 Contributing

This is a personal portfolio project, but **ideas, issues, and suggestions are always welcome**. Feel free to open an issue or submit a merge request if you see something that could be improved.

## 📄 License

This project is for personal portfolio purposes. **All rights reserved.**

---

**Contact**: [LinkedIn](https://www.linkedin.com/in/miguel-louren%C3%A7o-395335355/) · [GitLab](https://gitlab.com/miguel-lourenco-main) · [Email](mailto:migasoulou@gmail.com)

**Built with ❤️ by Miguel Lourenço**
