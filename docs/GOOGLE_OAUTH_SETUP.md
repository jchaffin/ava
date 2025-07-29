# Google OAuth Setup Guide

## Fixing "Invalid Redirect" Error

If you're getting an "Invalid redirect" error when trying to sign up with Google, follow these steps:

### 1. Get Your Correct Redirect URI

Visit this URL in your browser to get the correct redirect URI:
```
http://localhost:3001/api/auth/redirect-uri
```

This will show you the exact redirect URI that needs to be configured in Google OAuth.

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find your OAuth 2.0 Client ID and click **Edit**
4. In the **Authorized redirect URIs** section, add:
   ```
   http://localhost:3001/api/auth/callback/google
   ```
5. For production, also add:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
6. Click **Save**

### 3. Environment Variables

Make sure you have these environment variables set in your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 4. Common Issues

- **Wrong redirect URI**: The redirect URI must exactly match what's configured in Google OAuth
- **Missing environment variables**: Ensure all required environment variables are set
- **Wrong port**: Make sure you're using the correct port (3001 in development)
- **HTTPS in development**: Google OAuth requires HTTPS in production, but HTTP is fine for localhost
- **State missing error**: This can occur due to session issues or browser cache problems

### 5. Troubleshooting State Errors

If you get a "state missing from the response" error:

1. **Clear browser cache and cookies** for your domain
2. **Try in an incognito/private window**
3. **Check that your NEXTAUTH_SECRET is set** and consistent
4. **Restart your development server**
5. **Check the browser console** for any additional error messages

### 6. Testing

After making these changes:
1. Restart your development server
2. Try signing in with Google again
3. Check the browser console for any error messages

### 7. Debugging

If you're still having issues, check:
- Browser console for error messages
- Network tab for failed requests
- Server logs for authentication errors
- Google Cloud Console for any OAuth errors

The redirect URI should be: `http://localhost:3001/api/auth/callback/google` 