# StyleDecor - Backend

Stack: Node.js, Express, MongoDB (Mongoose), Firebase Admin, Stripe, Cloudinary.

## Quick start
1. Copy files into project directory.
2. `npm install`
3. Create `.env` from `.env.example` and fill in secrets.
4. Place Firebase service account JSON at path set in `.env` (`firebase-service-account.json`).
5. `npm run dev`
6. `npm run seed` to create demo users.

Demo credentials (seeded):
- customer@styledecor.com (role: user)
- decorator@styledecor.com (role: decorator)
- admin@styledecor.com (role: admin)
