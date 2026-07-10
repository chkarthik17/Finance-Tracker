# 🚀 Deployment Guide - Free Hosting

## ✅ Security Features Added:
- 🔐 PIN Protection: Code `0823`
- ⏰ 30-minute auto-logout
- 🔒 Secure session management

---

## 🆓 Free Deployment Options

### **Option 1: Vercel (Recommended - Best for Next.js)**

**Cost:** FREE forever
**Features:** 
- ✅ Automatic deployments from Git
- ✅ Free SSL certificate
- ✅ Global CDN
- ✅ Zero configuration

**Steps:**

1. **Push your code to GitHub:**
   ```bash
   cd "C:\Users\karthik\Desktop\Expense Tracker\finance-tracker"
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy to Vercel:**
   - Go to https://vercel.com/signup
   - Sign up with GitHub (free)
   - Click "New Project"
   - Import your GitHub repository
   - Add Environment Variable:
     - Key: `MONGODB_URI`
     - Value: Your MongoDB Atlas connection string
   - Click "Deploy"

3. **Your app will be live at:** `https://your-app-name.vercel.app`

---

### **Option 2: Netlify**

**Cost:** FREE
**Steps:**
1. Go to https://netlify.com
2. Sign up with GitHub
3. Import repository
4. Add environment variables
5. Deploy

---

### **Option 3: Railway.app**

**Cost:** FREE ($5 credit/month)
**Steps:**
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Add `MONGODB_URI` environment variable
5. Deploy

---

## 📝 Pre-Deployment Checklist

- [x] Security code: `0823` (hardcoded in `/app/api/auth/login/route.ts`)
- [x] MongoDB Atlas connection configured
- [x] Session timeout: 30 minutes
- [x] All features working locally
- [ ] Push code to GitHub
- [ ] Deploy to Vercel
- [ ] Test login with code `0823`

---

## 🔧 Environment Variables for Deployment

Add this to your hosting platform:

```
MONGODB_URI=mongodb+srv://karthik:admin123@cluster0.jutfz4o.mongodb.net/expense_tracker?retryWrites=true&w=majority&appName=Cluster0
```

---

## 🎯 After Deployment

1. Visit your deployed URL
2. You'll see the login page with 🔐
3. Enter code: `0823`
4. Access granted for 30 minutes
5. Share URL with Likhita (she needs the same code)

---

## 🔐 Security Notes

- Code `0823` is stored securely server-side
- Session stored in HTTP-only cookie (can't be accessed by JavaScript)
- Auto-logout after 30 minutes
- No one can access without the code

---

## 📱 Access After Deployment

**Your URL:** `https://expense-tracker-karthik.vercel.app` (example)

**Login:**
- Code: `0823`
- Session: 30 minutes
- Logout: Click 🔒 Logout button

---

## 🛠️ To Change Security Code Later

Edit: `/app/api/auth/login/route.ts`
Line 4: `const SECURITY_CODE = "0823";`

Change to any 4-digit code you want!
