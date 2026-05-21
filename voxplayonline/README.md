# voxplayonline.com

voxplayonline.com is a browser-based prototype with login, signup, menu UI, and admin tools.

## What Works

- Login and signup flow
- Auto login for the active user
- Locked navigation flow between login, signup, and menu
- Admin panel for owner/admin accounts
- Ban and Vox coin controls
- Share link tools in the menu

## Important Prototype Limit

- Accounts are currently stored in each browser's localStorage.
- That means if you share the site with friends, they can open and use it, but their accounts are saved only on their own device/browser.
- Admin changes are not shared between people yet.
- If you want real shared accounts, bans, coins, and admin actions across all players, voxplayonline.com needs a backend and database.

## Run Locally

- Open index.html in a browser.

## Share With Friends

The easiest way is to publish these files to a static host.

### Option 1: Netlify Drop

1. Open https://app.netlify.com/drop
2. Drag the whole project folder into the page
3. Netlify gives you a public URL
4. Send the temporary Netlify URL to your friends

### Option 2: GitHub Pages

1. Create a GitHub repository
2. Upload index.html, styles.css, app.js, and README.md
3. In repository settings, open Pages
4. Enable Pages from the main branch
5. Share the generated GitHub Pages URL

### Option 3: Vercel

1. Import the folder into Vercel
2. Deploy as a static site
3. Share the generated Vercel URL

## Notes

- The share buttons inside the menu copy or open the current hosted URL.
- If you do not own a custom domain yet, use the hosting provider's generated URL.
