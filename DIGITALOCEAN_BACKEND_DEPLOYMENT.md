# 🌊 DigitalOcean Backend Deployment Guide

Complete step-by-step guide to deploy your Node.js/Express backend on DigitalOcean.

---

## 📋 What You'll Deploy

- **Backend Stack:** Node.js + Express + MongoDB
- **Server:** DigitalOcean Droplet (Ubuntu)
- **Process Manager:** PM2
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt (Free)
- **Database:** MongoDB Atlas (Cloud)

---

## 💰 Cost Estimate

- **Droplet (Basic):** $6-12/month
- **Droplet (Production):** $18-24/month
- **MongoDB Atlas M10:** $57/month
- **Domain:** ~$12/year
- **Total:** ~$75-93/month

---

## 🚀 Step 1: Create DigitalOcean Droplet

### 1.1 Sign Up & Create Droplet

1. **Go to:** https://www.digitalocean.com
2. **Sign up** (Get $200 free credit for 60 days)
3. Click **"Create"** → **"Droplets"**

### 1.2 Choose Configuration

**Image:**
- Distribution: **Ubuntu 22.04 LTS**

**Droplet Size:**
- **Development:** Basic Plan - $6/month (1GB RAM, 1 vCPU)
- **Production:** Basic Plan - $18/month (2GB RAM, 2 vCPU) ✅ Recommended

**Datacenter Region:**
- Choose closest to your users (e.g., Bangalore, Singapore, New York)

**Authentication:**
- **Option A:** SSH Key (Recommended)
  - Click "New SSH Key"
  - Paste your public key (from `~/.ssh/id_rsa.pub`)
  - Name it (e.g., "My Laptop")
  
- **Option B:** Password (Easier for beginners)
  - Choose a strong password

**Hostname:**
- Name it something like: `cultura-backend` or `api-server`

### 1.3 Create Droplet

- Click **"Create Droplet"**
- Wait 1-2 minutes for it to be ready
- **Note down the IP address** (e.g., 123.45.67.89)

---

## 🔐 Step 2: Initial Server Setup

### 2.1 Connect to Your Droplet

**Via SSH Key:**
```bash
ssh root@YOUR_DROPLET_IP
```

**Via Password:**
```bash
ssh root@YOUR_DROPLET_IP
# Enter the password from email
```

### 2.2 Update System

```bash
# Update package list
apt update

# Upgrade installed packages
apt upgrade -y
```

### 2.3 Create a Non-Root User (Security Best Practice)

```bash
# Create new user
adduser cultura

# Add to sudo group
usermod -aG sudo cultura

# Switch to new user
su - cultura
```

---

## 🛠️ Step 3: Install Required Software

### 3.1 Install Node.js 20.x

```bash
# Download Node.js setup script
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 3.2 Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### 3.3 Install Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx

# Enable auto-start on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 3.4 Install Git

```bash
sudo apt install -y git

# Verify
git --version
```

---

## 📦 Step 4: Deploy Your Application

### 4.1 Clone Your Repository

```bash
# Go to home directory
cd ~

# Clone your repo (replace with your repo URL)
git clone https://github.com/YOUR_USERNAME/CULTURA_MAIN.git

# Navigate to server directory
cd CULTURA_MAIN/server
```

**If your repo is private:**
```bash
# You'll need to authenticate
# Option 1: Use Personal Access Token
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/CULTURA_MAIN.git

# Option 2: Setup SSH key on GitHub
ssh-keygen -t ed25519 -C "your_email@example.com"
cat ~/.ssh/id_ed25519.pub
# Copy and add to GitHub → Settings → SSH Keys
```

### 4.2 Install Dependencies

```bash
# Install production dependencies only
npm install --production

# Or install all (if you need dev tools)
npm install
```

### 4.3 Create Environment Variables

```bash
# Create .env file
nano .env
```

**Paste this and update with your values:**

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cultura?retryWrites=true&w=majority
MONGO_MAX_POOL=20
MONGO_MIN_POOL=5

# Frontend URL (Update after frontend deployment)
FRONTEND_URL=https://yourdomain.com

# JWT Secret (Generate a strong random string)
JWT_SECRET=your-super-secret-key-min-32-characters-long-random-string
JWT_EXPIRE=7d

# Cloudinary (For image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Gateway - Stripe
STRIPE_SECRET_KEY=sk_test_or_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Payment Gateway - Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Performance Monitoring (Optional)
ENABLE_REQUEST_TIMER=false
ENABLE_HEALTH_MONITOR=true
ENABLE_DB_INDEXES=false
```

**Save:** Press `Ctrl + X`, then `Y`, then `Enter`

### 4.4 Test Your Application

```bash
# Start server manually
npm start

# In another terminal/tab, test it
curl http://localhost:3000/test
# Should return: {"message":"Server is running properly"}

# Stop the server (Ctrl + C)
```

---

## ⚙️ Step 5: Setup PM2 (Keep Server Running)

### 5.1 Check if PM2 Config Exists

```bash
# Check if ecosystem.config.js exists
ls -la ecosystem.config.js
```

If it doesn't exist, create it:

```bash
nano ecosystem.config.js
```

**Paste this:**

```javascript
module.exports = {
  apps: [{
    name: 'cultura-api',
    script: './server.js',
    instances: 1,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
```

### 5.2 Start Application with PM2

```bash
# Start the app
pm2 start ecosystem.config.js --env production

# Check status
pm2 status

# View logs
pm2 logs cultura-api

# Monitor (live view)
pm2 monit
```

### 5.3 Save PM2 Configuration

```bash
# Save current PM2 processes
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Copy and run the command it shows (will look like):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u cultura --hp /home/cultura
```

---

## 🌐 Step 6: Configure Nginx (Reverse Proxy)

### 6.1 Create Nginx Configuration

```bash
# Create config file
sudo nano /etc/nginx/sites-available/cultura
```

**Paste this configuration:**

```nginx
server {
    listen 80;
    server_name YOUR_DROPLET_IP;  # Replace with your IP or domain

    # Rate limiting zone
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    location / {
        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;

        # Proxy to Node.js app
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache bypass
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Max upload size
    client_max_body_size 10M;
}
```

**Save:** `Ctrl + X` → `Y` → `Enter`

### 6.2 Enable the Site

```bash
# Create symbolic link to enable site
sudo ln -s /etc/nginx/sites-available/cultura /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

### 6.3 Configure Firewall

```bash
# Allow OpenSSH
sudo ufw allow OpenSSH

# Allow Nginx
sudo ufw allow 'Nginx Full'

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## 🧪 Step 7: Test Your Deployment

### 7.1 Test from Browser

Open your browser and go to:
```
http://YOUR_DROPLET_IP/test
```

You should see:
```json
{"message":"Server is running properly"}
```

### 7.2 Test API Endpoints

```bash
# From your local machine
curl http://YOUR_DROPLET_IP/api/listings?page=1&limit=12

# Should return listings data
```

---

## 🔒 Step 8: Setup Domain & SSL (Optional but Recommended)

### 8.1 Point Domain to Droplet

1. **Buy a domain** (Namecheap, GoDaddy, etc.)
2. **Add DNS Records:**
   - **A Record:**
     - Name: `api` (for api.yourdomain.com)
     - Value: `YOUR_DROPLET_IP`
     - TTL: `300`

3. **Wait 5-30 minutes** for DNS propagation

### 8.2 Update Nginx Configuration

```bash
# Edit Nginx config
sudo nano /etc/nginx/sites-available/cultura
```

**Change this line:**
```nginx
server_name YOUR_DROPLET_IP;
```

**To:**
```nginx
server_name api.yourdomain.com;
```

**Reload Nginx:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 8.3 Install SSL Certificate (Free with Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Follow the prompts:
# - Enter email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Test auto-renewal
sudo certbot renew --dry-run
```

**Now access your API:**
```
https://api.yourdomain.com/test
```

---

## 🗄️ Step 9: Setup MongoDB Atlas

### 9.1 Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a **FREE M0 cluster** (512MB) or **M10 cluster** ($57/month for production)

### 9.2 Configure Database

1. **Choose Region:** Same as your DigitalOcean droplet
2. **Cluster Name:** cultura-db
3. **Click "Create"**

### 9.3 Setup Security

**Database Access:**
1. Go to **Database Access**
2. Click **"Add New Database User"**
3. Username: `cultura_user`
4. Password: Generate a strong password
5. Role: **Read and write to any database**
6. Click **"Add User"**

**Network Access:**
1. Go to **Network Access**
2. Click **"Add IP Address"**
3. **Add Your Droplet IP** or **Allow from Anywhere** (0.0.0.0/0)
4. Click **"Confirm"**

### 9.4 Get Connection String

1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string:
   ```
   mongodb+srv://cultura_user:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password
5. Add database name: `cultura`
   ```
   mongodb+srv://cultura_user:yourpassword@cluster.mongodb.net/cultura?retryWrites=true&w=majority
   ```

### 9.5 Update .env File

```bash
# On your droplet
cd ~/CULTURA_MAIN/server
nano .env
```

Update the `MONGODB_URI` with your connection string.

**Restart PM2:**
```bash
pm2 restart cultura-api
pm2 logs cultura-api
```

---

## 📊 Step 10: Monitoring & Maintenance

### 10.1 Useful PM2 Commands

```bash
# View logs
pm2 logs cultura-api

# View last 100 lines
pm2 logs cultura-api --lines 100

# Monitor CPU/Memory
pm2 monit

# Check status
pm2 status

# Restart app
pm2 restart cultura-api

# Stop app
pm2 stop cultura-api

# Delete app from PM2
pm2 delete cultura-api

# View info
pm2 info cultura-api
```

### 10.2 Update Your Code

```bash
# SSH into droplet
ssh root@YOUR_DROPLET_IP

# Navigate to project
cd ~/CULTURA_MAIN/server

# Pull latest code
git pull origin main

# Install any new dependencies
npm install

# Restart application
pm2 restart cultura-api

# Check logs
pm2 logs cultura-api
```

### 10.3 View Server Logs

```bash
# PM2 logs
pm2 logs

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -xe
```

### 10.4 Monitor Resources

```bash
# CPU and Memory usage
htop

# Or use top
top

# Disk space
df -h

# Check running processes
pm2 status
```

---

## 🔄 Step 11: Setup Auto-Deploy (Optional)

Create a simple deploy script:

```bash
cd ~/CULTURA_MAIN/server
nano deploy.sh
```

**Add this:**
```bash
#!/bin/bash
echo "🚀 Deploying Cultura Backend..."

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Restart PM2
pm2 restart cultura-api

echo "✅ Deployment complete!"
pm2 logs cultura-api --lines 50
```

**Make executable:**
```bash
chmod +x deploy.sh
```

**Deploy anytime:**
```bash
./deploy.sh
```

---

## 🚨 Troubleshooting

### Issue: Can't connect to server

```bash
# Check if PM2 is running
pm2 status

# Check logs
pm2 logs cultura-api

# Check Nginx
sudo systemctl status nginx

# Check firewall
sudo ufw status
```

### Issue: MongoDB connection failed

```bash
# Check MongoDB IP whitelist in Atlas
# Verify connection string in .env
# Test connection
mongo "your-connection-string"
```

### Issue: 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Restart PM2
pm2 restart cultura-api

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: Port 3000 already in use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 PID_NUMBER

# Or stop all PM2 processes
pm2 delete all
pm2 start ecosystem.config.js
```

### Issue: Out of memory

```bash
# Check memory usage
free -h

# Upgrade your droplet to higher tier
# Or optimize your application
```

---

## ✅ Deployment Checklist

- [ ] DigitalOcean Droplet created
- [ ] SSH access working
- [ ] Node.js installed
- [ ] PM2 installed
- [ ] Nginx installed
- [ ] Code cloned from GitHub
- [ ] Dependencies installed
- [ ] .env file created with all variables
- [ ] MongoDB Atlas setup and connected
- [ ] Application running with PM2
- [ ] Nginx configured as reverse proxy
- [ ] Firewall configured
- [ ] SSL certificate installed (if using domain)
- [ ] API accessible from browser
- [ ] Endpoints tested and working

---

## 🎯 Your Backend is Live!

**Access your API:**
- Without domain: `http://YOUR_DROPLET_IP/test`
- With domain: `https://api.yourdomain.com/test`

**Next Steps:**
1. Update frontend `VITE_BACKEND_API` to point to your backend URL
2. Test all API endpoints
3. Monitor logs for errors
4. Setup backups
5. Configure monitoring (PM2 Plus, Sentry, etc.)

---

## 📚 Additional Resources

- [DigitalOcean Docs](https://docs.digitalocean.com/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)

---

## 💡 Pro Tips

1. **Enable MongoDB Backups** in Atlas
2. **Setup PM2 monitoring** at https://app.pm2.io
3. **Use environment-specific configs** for staging/production
4. **Keep your droplet updated:** `sudo apt update && sudo apt upgrade`
5. **Monitor disk space:** MongoDB logs can grow large
6. **Setup alerts** for downtime
7. **Regular backups** of your database

---

**You're all set! 🎉**

Need help? Check logs first:
```bash
pm2 logs cultura-api
```
