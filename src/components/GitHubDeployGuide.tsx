import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { translations } from '../utils/translations';
import { 
  Github, 
  Terminal, 
  Download, 
  Upload, 
  Copy, 
  Check, 
  Globe, 
  FolderGit2, 
  FileText, 
  Printer, 
  RotateCcw,
  FileSpreadsheet
} from 'lucide-react';
import { exportTasksToCSV, exportMaterialsToCSV } from '../utils/csvExport';

export const GitHubDeployGuide: React.FC = () => {
  const { 
    projects, 
    tasks, 
    dailyLogs, 
    materials, 
    snags, 
    exportDataJson, 
    importDataJson, 
    resetToSampleData, 
    language 
  } = useProject();

  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const gitCommands = `# Step 1: Initialize Git in your project folder
git init

# Step 2: Add all files
git add .

# Step 3: Commit with message
git commit -m "feat: Al Asad Constructors Task & Project Management App"

# Step 4: Link to your GitHub Repository
git remote add origin https://github.com/<YOUR-USERNAME>/alasad-constructors-app.git

# Step 5: Push to GitHub
git branch -M main
git push -u origin main`;

  const githubActionsYaml = `name: Deploy Al Asad Constructors to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static site
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
          <Github className="w-4 h-4" />
          <span>{language === 'ur' ? 'گٹ ہب پر چلانے کی مکمل رہنمائی' : 'Run & Host on GitHub Instructions'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {language === 'ur' ? 'یہ ایپ گٹ ہب پر کیسے چلائیں؟' : 'How to Run This App on GitHub'}
        </h1>
        <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed">
          {language === 'ur' 
            ? 'یہ ایپ 100 فیصد کلائنٹ سائیڈ (Static Vite + React SPA) کے طور پر بنائی گئی ہے۔ اس کو چلانے کے لیے کسی مہنگے سرور کی ضرورت نہیں، یہ سیدھا GitHub Pages پر بالکل مفت لائیو چل سکتی ہے اور اس کا سارا ڈیٹا آپ اپنے GitHub ریپوزٹری میں بیک اپ رکھ سکتے ہیں۔'
            : 'This construction tracker is architected as a high-performance, standalone Single Page Application (Vite + React). It has zero server runtime dependencies, making it 100% compatible with free GitHub Pages hosting or local git cloning.'}
        </p>

        {/* Quick Data Action Bar */}
        <div className="pt-4 border-t border-neutral-800 flex flex-wrap items-center gap-3">
          <button
            onClick={exportDataJson}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'ur' ? 'مکمل ڈیٹا ڈاؤنلوڈ کریں (JSON)' : 'Download Database JSON'}</span>
          </button>

          <button
            onClick={() => exportTasksToCSV(tasks, projects, language)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
            title="Export all tasks to Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>{language === 'ur' ? 'ٹاسکس CSV ڈاؤنلوڈ' : 'Export Tasks CSV'}</span>
          </button>

          <button
            onClick={() => exportMaterialsToCSV(materials, projects, language)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
            title="Export material ledger to Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>{language === 'ur' ? 'میٹریل لیجر CSV' : 'Export Materials CSV'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{language === 'ur' ? 'سائٹ رپورٹ پرنٹ / PDF کریں' : 'Print / Save as PDF'}</span>
          </button>

          <button
            onClick={resetToSampleData}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors ml-auto"
            title="Reset to sample construction sites"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'ur' ? 'ڈیمو ڈیٹا ری سیٹ' : 'Reset Demo Data'}</span>
          </button>
        </div>
      </div>

      {/* 3 Step Deployment Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">
            01
          </div>
          <h3 className="text-base font-bold text-white">
            {language === 'ur' ? '1. گٹ ہب پر پش کریں' : '1. Push to GitHub'}
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {language === 'ur' 
              ? 'اپنے کمپیوٹر پر ٹرمینل کھول کر کوڈ کو اپنے گٹ ہب اکاؤنٹ پر پش کریں۔' 
              : 'Initialize your git repo, commit the application files, and push to your GitHub repository.'}
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">
            02
          </div>
          <h3 className="text-base font-bold text-white">
            {language === 'ur' ? '2. گٹ ہب پیجز فعال کریں' : '2. Enable GitHub Pages'}
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {language === 'ur'
              ? 'GitHub ریپو کی Settings میں جا کر "Pages" کے تحت "GitHub Actions" منتخب کریں۔'
              : 'Go to your repository Settings → Pages, and select "GitHub Actions" as the source.'}
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm">
            03
          </div>
          <h3 className="text-base font-bold text-white">
            {language === 'ur' ? '3. آن لائن اور آف لائن استعمال' : '3. Free Live App'}
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {language === 'ur'
              ? 'آپ کی تعمیراتی ایپ https://<username>.github.io/<repo> پر بغیر کسی معاوضے کے ہمیشہ لائیو رہے گی!'
              : 'Your app will be live at https://<username>.github.io/<repo> and works 100% on phones, tablets, and laptops.'}
          </p>
        </div>
      </div>

      {/* Terminal Code Snippet */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between bg-neutral-950 px-4 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Terminal Commands (Git Setup)</span>
          </div>
          <button
            onClick={() => copyToClipboard(gitCommands, 'git')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
          >
            {copiedSection === 'git' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{language === 'ur' ? 'کاپی ہو گیا' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'کاپی کمانڈز' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-xs font-mono text-amber-300/90 bg-neutral-950 overflow-x-auto leading-relaxed">
          {gitCommands}
        </pre>
      </div>

      {/* GitHub Actions Workflow File */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between bg-neutral-950 px-4 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <FolderGit2 className="w-4 h-4 text-amber-400" />
            <span>.github/workflows/deploy.yml (Automatic GitHub Pages Build)</span>
          </div>
          <button
            onClick={() => copyToClipboard(githubActionsYaml, 'yaml')}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
          >
            {copiedSection === 'yaml' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{language === 'ur' ? 'کاپی ہو گیا' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{language === 'ur' ? 'کاپی فائل' : 'Copy YAML'}</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-4 text-xs font-mono text-neutral-300 bg-neutral-950 overflow-x-auto leading-relaxed max-h-80">
          {githubActionsYaml}
        </pre>
      </div>

      {/* Data Backup & Git Commits explanation */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>{language === 'ur' ? 'تعمیراتی ڈیٹا کا محفوظ بیک اپ' : 'Data Persistence in Git Repositories'}</span>
        </h3>
        <p className="text-xs text-neutral-300 leading-relaxed">
          {language === 'ur'
            ? 'جب بھی آپ نیا پروجیکٹ، کام یا روزنامچہ لکھیں، اوپر "مکمل ڈیٹا ڈاؤنلوڈ کریں (JSON)" کے بٹن سے فائل محفوظ کر کے اپنے گٹ ریپو میں commit کر سکتے ہیں۔ اس طرح آپ کے تمام تعمیراتی ریکارڈز ہمیشہ کے لیے گٹ ہب ہسٹری میں محفوظ رہیں گے اور کوئی بھی نقصان نہیں ہو گا۔'
            : 'Clicking "Download Database JSON" generates a portable snapshot of all projects, tasks, checklists, daily logs, materials, and snags. You can commit this file into your git repository to keep permanent historical records of site progress.'}
        </p>
      </div>
    </div>
  );
};
