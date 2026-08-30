# Neon Aura — Advanced MERN Music App

An original neon/violet/blue music streaming app foundation with real authentication, MongoDB, Cloudinary media uploads, playlists, a persistent audio player, search, likes, admin catalog tools, and Razorpay Premium checkout.

## 1. Server setup

```bash
cd server
npm install
copy .env.example .env   # Windows
# or: cp .env.example .env
npm run dev
```

Fill `server/.env`:

- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: long random secret
- `CLIENT_URL`: `http://localhost:5173`
- `ADMIN_EMAIL`: the email that should become admin on registration
- `CLOUDINARY_*`: required for real song/cover uploads
- `RAZORPAY_*`: required only for Premium checkout

The API runs on `http://localhost:5000`.

## 2. Client setup

```bash
cd client
npm install
copy .env.example .env   # Windows
# or: cp .env.example .env
npm run dev
```

`client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Open `http://localhost:5173`.

## 3. Cloudinary

Create a Cloudinary account and put the cloud name, API key and API secret in `server/.env`.

The actual integration is in:

- `server/services/cloudinary.js` — config
- `server/routes/songs.js` — multipart upload, `cloudinary.uploader.upload_stream`, and deletion

Admin uploads audio to `neon-aura/songs` as a video resource and cover images to `neon-aura/covers`.

## 4. Admin

Set `ADMIN_EMAIL` before creating your account. Register using exactly that email. That user receives the `admin` role and gets **Admin studio** in the sidebar.

If you already registered before setting `ADMIN_EMAIL`, update that user's `role` to `admin` once in MongoDB Atlas, then log in again.

## 5. Razorpay

Use Test Mode credentials. Put the key id/secret in `server/.env` and the public key id in `client/.env`.

Premium endpoint flow:

1. `/api/payments/order`
2. Razorpay Checkout
3. `/api/payments/verify`
4. User becomes premium for 30 days

Do not expose `RAZORPAY_KEY_SECRET` or Cloudinary API secret in frontend code.

## Included features

- JWT register/login/profile
- MongoDB user, song and playlist models
- Cloudinary audio + cover upload/delete
- Search by song/artist/album
- Trending endpoint
- Play count + recently played
- Like/unlike songs
- Create/delete playlists and add/remove songs
- Queue-based audio player
- Play/pause/next/previous/seek/volume
- Premium checkout with Razorpay verification
- Admin catalog upload/delete
- Responsive original Neon Aura UI

## Important

This is a full working application foundation, but it does not ship copyrighted commercial music. Upload only audio you have the rights to use. Google OAuth, social feed, collaborative realtime playlists, advanced recommendation/ML, offline playback, and production billing webhooks are additional production features rather than pretending to be implemented here.
