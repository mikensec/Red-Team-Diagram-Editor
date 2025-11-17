# Red Team Attack Diagram Tool

A browser-only React application for creating and editing red team attack diagrams using React Flow.

## Project info

**URL**: https://lovable.dev/projects/c6bea9df-92e9-4881-92a3-302e13620985

## Features

- **Diagram Editor**: Full-featured diagram editor using React Flow
- **Node Types**: 6 distinct attack stage nodes (Initial Access, C2, Lateral Movement, Execution, Privilege Escalation, Objective)
- **Color Coded**: Each node type has a unique color for easy identification
- **Auto-save**: Diagrams automatically save to localStorage
- **Import/Export**: Export diagrams as JSON and import them back
- **No Backend**: Runs 100% client-side in the browser
- **GitHub Pages Ready**: Configured for easy deployment to GitHub Pages

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c6bea9df-92e9-4881-92a3-302e13620985) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c6bea9df-92e9-4881-92a3-302e13620985) and click on Share -> Publish.

## Deploying to GitHub Pages

This project is configured to work with GitHub Pages out of the box.

### Steps to deploy:

1. **Build the project:**
   ```sh
   npm run build
   ```

2. **Deploy to GitHub Pages:**
   
   If you don't have `gh-pages` installed:
   ```sh
   npm install -D gh-pages
   ```
   
   Add these scripts to your `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
   
   Then deploy:
   ```sh
   npm run deploy
   ```

3. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Navigate to Settings > Pages
   - Under "Source", select the `gh-pages` branch
   - Your app will be live at `https://[username].github.io/[repo-name]/`

**Note**: The `base` in `vite.config.ts` is set to `"./"` for flexible deployment. If deploying to a subdirectory, you may need to adjust this to `"/repo-name/"`.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
