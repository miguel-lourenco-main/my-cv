# Portfolio Website

A modern, responsive single-page portfolio and CV website built with Next.js, TypeScript, and Tailwind CSS. Configured for deployment on both GitHub Pages and GitLab Pages.

## 🚀 Features

- **Modern Stack**: Built with Next.js 14, TypeScript, and Tailwind CSS
- **Single Page Design**: All content on one page with smooth scroll navigation
- **Responsive Design**: Mobile-first approach with dark mode support
- **Static Export**: Optimized for static hosting (GitHub/GitLab Pages)
- **Dual Deployment**: Configured for both GitHub Pages and GitLab Pages
- **SEO Optimized**: Meta tags, Open Graph, and structured data
- **Expandable Structure**: Easy to add individual project pages later

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Single-page homepage
├── .github/workflows/     # GitHub Actions for deployment
├── .gitlab-ci.yml         # GitLab CI configuration
├── public/                # Static assets
├── next.config.js         # Next.js configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── setup-remotes.sh       # Git remote setup script
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Git Remotes

First, create repositories on both GitHub and GitLab with the same name (e.g., `portfolio`).

Then run the setup script:

```bash
./setup-remotes.sh git@github.com:username/portfolio.git git@gitlab.com:username/portfolio.git
```

Or set up manually:

```bash
# Add multiple remotes
git remote add github git@github.com:username/portfolio.git
git remote add gitlab git@gitlab.com:username/portfolio.git

# Set up origin to push to both
git remote add origin git@github.com:username/portfolio.git
git remote set-url --add --push origin git@github.com:username/portfolio.git
git remote set-url --add --push origin git@gitlab.com:username/portfolio.git
```

### 3. Configure Domains

#### For GitHub Pages:
1. Go to repository Settings → Pages
2. Set source to "GitHub Actions"
3. Add custom domain in Pages settings (optional)
4. Create `CNAME` file in `public/` directory with your domain

#### For GitLab Pages:
1. Go to Settings → Pages
2. Your site will be available at `https://username.gitlab.io/repository-name`
3. Add custom domain in Pages settings (optional)

### 4. Deploy

Push to both repositories:

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

Or push individually:

```bash
git push github main  # Deploy to GitHub Pages
git push gitlab main  # Deploy to GitLab Pages
```

## 🎨 Customization

### Personal Information

Update the following in `app/page.tsx`:

1. **Hero Section**: Replace "Your Name" with your actual name
2. **About Section**: Update bio, skills, and technologies
3. **Contact Section**: Update email and social media links
4. **Footer**: Update copyright information

Also update in `app/layout.tsx`:
- Meta tags, title, and description
- Open Graph and Twitter card information

### Adding Projects

When you're ready to add projects:

1. **Update the Projects Section**: Replace the "Coming Soon" placeholder with actual project cards
2. **For Individual Project Pages**: Create new routes like `app/projects/[slug]/page.tsx`

Example project card structure:
```jsx
<div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
  <div className="h-48 bg-cover bg-center" style={{backgroundImage: 'url(/project-image.jpg)'}}></div>
  <div className="p-6">
    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Project Name</h3>
    <p className="text-slate-600 dark:text-slate-300 mb-4">Project description...</p>
    <div className="flex space-x-4">
      <a href="https://live-demo.com" className="text-blue-600 hover:text-blue-800">Live Demo</a>
      <a href="https://github.com/username/repo" className="text-slate-600 hover:text-slate-800">GitHub</a>
    </div>
  </div>
</div>
```

### Expanding to Multiple Pages

When ready to add individual project pages:

1. Create `app/projects/page.tsx` for a projects listing page
2. Create `app/projects/[slug]/page.tsx` for individual project details
3. Update navigation in the main page to link to `/projects`
4. Keep the projects preview section on the homepage

## 🚀 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm start
```

## 📊 Deployment URLs

After deployment, your sites will be available at:

- **GitHub Pages**: `https://username.github.io/repository-name`
- **GitLab Pages**: `https://username.gitlab.io/repository-name`

With custom domains:
- **GitHub**: `https://your-domain.com`
- **GitLab**: `https://portfolio.your-domain.com` (subdomain recommended)

## 🔧 CI/CD Pipeline

### GitHub Actions
- Automatically builds and deploys on push to `main`
- Uses official GitHub Pages action
- Builds static site to `out/` directory

### GitLab CI
- Builds on every push and merge request
- Deploys to production on `main` branch
- Optional staging environment for merge requests

## 📝 Environment Variables

For different configurations per platform:

```bash
# GitHub Pages (set in repository secrets)
BASE_PATH=""  # Usually empty for custom domains

# GitLab Pages (set in CI/CD variables)
BASE_PATH="/repository-name"  # If using gitlab.io subdomain
```

## 🔄 Content Structure

### Current Single-Page Sections:
- **Hero**: Introduction and call-to-action
- **About**: Bio, skills, and technologies
- **Projects**: Project showcase (currently placeholder)
- **Contact**: Email and social media links

### Future Expansion Ideas:
- **Experience/Resume**: Work history and education
- **Blog**: Technical articles and thoughts
- **Individual Project Pages**: Detailed project case studies
- **Skills/Certifications**: Detailed technical skills

## 🛡️ Security Notes

- Both repositories can be public (recommended for portfolio visibility)
- Sensitive information should be in environment variables
- No API keys or secrets should be committed

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## Next Steps

1. **Install dependencies**: `npm install`
2. **Customize content**: Update your information in `app/page.tsx` and `app/layout.tsx`
3. **Create repositories**: Set up on both GitHub and GitLab
4. **Setup remotes**: Run `./setup-remotes.sh` with your repository URLs
5. **Deploy**: `git push origin main`
6. **Add projects**: Replace placeholder content as you build projects

Your single-page portfolio will be live on both platforms! 🎉

When you're ready to expand with individual project pages, the structure is already set up to easily accommodate that growth. 