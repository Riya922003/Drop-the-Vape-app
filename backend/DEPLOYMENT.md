# Backend VM Deployment

## Required VM environment

Create `backend/.env` on the VM:

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require
PGSSL=true
```

Do not commit `.env`.

## Run the API container

```bash
cd backend
docker compose up -d --build
docker compose logs -f api
```

The compose file binds Node to `127.0.0.1:5000`, so the API is reachable only from the VM itself. Put Nginx in front for public traffic.

## Nginx

Copy `backend/nginx/drop-the-vape-api.conf` to:

```bash
/etc/nginx/sites-available/drop-the-vape-api
```

Replace `api.yourdomain.com`, enable the site, test Nginx, and reload:

```bash
sudo ln -s /etc/nginx/sites-available/drop-the-vape-api /etc/nginx/sites-enabled/drop-the-vape-api
sudo nginx -t
sudo systemctl reload nginx
```

Add HTTPS with Certbot after DNS points to the VM:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

Set the frontend API URL to:

```powershell
$env:EXPO_PUBLIC_API_URL="https://api.yourdomain.com"
npx expo start
```
