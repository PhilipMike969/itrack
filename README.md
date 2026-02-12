This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
# Database
DATABASE_URL=your_database_url_here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Setting Up Resend for Email Notifications

To send tracking emails to customers, you need to set up Resend (it's super easy!):

1. **Sign up for Resend**: Go to [resend.com](https://resend.com) and create a free account
2. **Get your API Key**: 
   - After signing up, go to [API Keys](https://resend.com/api-keys)
   - Click "Create API Key"
   - Give it a name (e.g., "iTrackNow Production")
   - Copy the API key
3. **Update `.env.local`**:
   - Set `RESEND_API_KEY` to your API key
4. **Email Sender**: 
   - Free tier uses `noreply@resend.dev` as sender (works perfectly!)
   - If you have a domain, you can verify it and use `noreply@yourdomain.com`

**Free tier includes**: 100 emails/day, 3,000 emails/month - perfect for most projects!

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
