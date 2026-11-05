# Meimar BuildTrack (معمار تعمیراتی ٹریکر)

A professional construction project and task tracking application with Kanban board, Gantt chart schedule, daily site logs (Roznamcha), materials ledger, and snag/punch list management. Built with React 19, TypeScript, Vite, and Tailwind CSS.

## Features

- **Multi-Project Management**: Track construction sites with budgets, timelines, resident engineers, and phase tracking (Foundation, RCC Structure, Masonry, MEP, Finishing, Handover).
- **Task Tracking & Kanban Board**: 5-lane visual workflow (Scheduled, In Progress, Inspection, Completed, Delayed) with interactive checklists, crew size tracking, and trade assignments.
- **Gantt Timeline**: Visual schedule highlighting Critical Path tasks and today's construction marker.
- **Daily Site Log (Roznamcha - روزنامچہ)**: Record daily workforce attendance by trade (Steel fixers, Carpenters, Masons, Plumbers), weather impact on concrete curing, deliveries, and zero-safety-incident tracking.
- **Materials Ledger & Budget**: Track procurement for cement, deformed steel rebar grade 60, sand, gravel, and finishes with invoice records.
- **Snag & Punch List**: Defect rectification tracking before final handover.
- **Bilingual Interface**: Quick one-click toggle between English and Urdu (اردو).
- **GitHub & Offline Ready**: 100% client-side with persistent LocalStorage, one-click JSON backup export/import, and print-ready site reports.

## Running Locally

1. Clone repository:
```bash
git clone https://github.com/<your-username>/meimar-construction-app.git
cd meimar-construction-app
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for Production / GitHub Pages:
```bash
npm run build
```

## Free Deployment to GitHub Pages

1. Push this repository to GitHub.
2. In GitHub, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically build and publish your site at `https://<username>.github.io/<repo-name>/`.
