# The Ledger — a shared finance tracker for two

A Next.js app for tracking income, expenses, investments, and savings goals,
shared between Karthik and Likhita. Data is stored in MongoDB Atlas,
so it's real, persistent, and cloud-based — this is a
proper cloud database, not local/browser storage.

## What's inside

- **Ledger** — net worth, cash balance, invested total, savings rate, monthly income/expense trend, spending by category, recent entries
- **Entries** — add/edit/delete income & expense transactions, tagged by person and category
- **Holdings** — track investments (amount invested vs. current value), with gain/loss
- **Forecast** — projects cash balance 3/6/12 months out from your recent average net savings, plus an investment growth projection
- **Plans** — savings goals with progress bars and target dates

Both of you see the same data — no separate accounts, it's shared by design.

## 1. Set up the database (MongoDB Atlas — free tier is enough)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster (M0 Free tier is sufficient).
3. Create a database user with a username and password.
4. Add your IP address to the IP Access List (or use 0.0.0.0/0 for development).
5. Click "Connect" → "Connect your application" and copy the connection string.
6. The database `expense_tracker` and collections (`entries`, `holdings`, `plans`) will be created automatically when you first add data.

## 2. Run it locally

```bash
cp .env.local.example .env.local   # then paste in your MongoDB connection string
npm install
npm run dev
```

Edit `.env.local` and replace the placeholders with your actual MongoDB Atlas connection string.

Visit `http://localhost:3000`.

## 3. Deploy to Vercel

1. Push this folder to a **private** GitHub repo (see below).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import that repo.
3. In the project's **Environment Variables** settings, add your MongoDB connection string:
   - `MONGODB_URI`
4. Deploy. Share the resulting URL with each other.

## Pushing this to GitHub

From inside this folder:

```bash
git add -A
git commit -m "Initial commit: shared finance tracker"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Create the empty repo on GitHub first (github.com → New repository — **keep it
private**), then run the commands above.

## A note on privacy

There's no login screen. Anyone with your deployed URL can read and write the data — that's the trade-off for a simple two-person app with no accounts. It's fine as a private link between the two of you, but:

- Keep the GitHub repo **private**.
- Don't post the deployed URL publicly.
- Keep your MongoDB connection string secure and never commit it to Git.
- If you want a real login layer later (so only you two can access it even if the URL leaks), authentication middleware can be added on top of this.

## A note on the forecast

The Forecast tab is a simple trend extrapolation from your recent average
net savings and each holding's own implied return — not financial advice.
Treat it as a rough guide, especially with only a few months of data.
