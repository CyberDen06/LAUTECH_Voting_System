# Lovable Deployment Guide

This guide covers deploying the LAUTECH JUPEB Awards Voting System to Lovable.

## Prerequisites

- GitHub account with the repository pushed
- Lovable account (lovable.dev)
- Admin access to the Lovable project

## Step-by-Step Deployment

### 1. Prepare Repository

Ensure your GitHub repository includes:
- ✅ All source files (src/, public/)
- ✅ Configuration files (tsconfig.json, vite.config.ts, package.json)
- ✅ .gitignore (excludes node_modules, dist, etc.)
- ✅ README.md with setup instructions
- ✅ LAUTECH logo in public/lautech-logo.svg

### 2. Connect to Lovable

1. Go to [Lovable](https://lovable.dev)
2. Create new project or import from GitHub
3. Select your repository
4. Choose branch (typically `main` or `master`)

### 3. Configure Build Settings

In Lovable project settings:

**Build Command:**
```
npm run build
```

**Install Command:**
```
npm install
```

**Output Directory:**
```
dist
```

**Environment Variables:**
- None required for basic deployment (all data stored locally)

### 4. Deploy

1. Click "Deploy" or "Redeploy"
2. Lovable will:
   - Install dependencies (`npm install`)
   - Run build command (`npm run build`)
   - Deploy `dist/` contents to Lovable's CDN
3. Wait for deployment to complete (~2-5 minutes)

### 5. Verify Deployment

1. Open deployed URL (provided by Lovable)
2. Test home page loads with LAUTECH logo
3. Test student login flow
4. Test admin login (credentials: admin@lautech.edu.ng / admin1234)
5. Verify data persists in localStorage

## Environment-Specific Configuration

### Production Environment (Lovable)

No changes needed. The application works entirely client-side:
- All data stored in browser localStorage
- No backend API required
- No API keys or secrets needed

### Local Development

```bash
npm run dev
```
Opens on `http://localhost:5173`

## Lovable Features Used

- **Automatic Builds**: Redeploy on GitHub push
- **Edge Caching**: Fast global CDN delivery
- **HTTPS**: Automatic SSL/TLS
- **Custom Domain**: Configure domain in Lovable settings
- **Environment Variables**: (Not needed for this app, but available if needed)

## Custom Domain Setup (Lovable)

1. In Lovable project settings → Domains
2. Add your custom domain (e.g., `jupeb-voting.lautech.edu.ng`)
3. Update DNS records as instructed by Lovable
4. SSL certificate auto-provisioned

## Troubleshooting Deployment

### Build Fails
- Check `npm run build` locally completes successfully
- Verify all dependencies in package.json
- Check TypeScript: `npx tsc --noEmit`

### Logo Not Showing
- Verify `public/lautech-logo.svg` exists in repository
- Check file path in App.tsx (should be `/lautech-logo.svg`)
- Public files must be in `public/` directory
- To customize logo: edit the SVG directly with your branding colors/shapes

### Data Not Persisting
- localStorage works only in HTTPS environments
- Lovable uses HTTPS automatically
- Check browser console for storage quota errors

### Performance Issues
- The bundle is ~177KB gzipped (reasonable for this app)
- Lovable CDN caches all assets
- First load may be slower; subsequent loads cached

## Rollback Previous Version

If issues occur after deployment:

1. Go to Lovable project → Deployments
2. Select previous working deployment
3. Click "Revert" or "Rollback"
4. Previous version will be restored immediately

## Monitoring

**Lovable Dashboard:**
- View deployment history
- Check build logs
- Monitor uptime
- View analytics (if enabled)

**Application Monitoring:**
- Check browser console for errors (F12)
- Monitor localStorage usage (Dev Tools → Storage)
- Track election results in Admin Dashboard

## Security Considerations for Lovable

1. **Data Privacy**: All voter data stays in browser localStorage—never sent to servers
2. **HTTPS**: Lovable enforces HTTPS automatically
3. **API Keys**: No backend API required
4. **Credentials**: Admin credentials stored locally (consider unique per deployment)
5. **DDoS Protection**: Lovable includes DDoS protection on CDN

## Post-Deployment Checklist

- [ ] Deployed URL is live and accessible
- [ ] LAUTECH logo displays on home page
- [ ] Student login flow works end-to-end
- [ ] Admin login with default credentials works
- [ ] Data imports from CSV/XLSX
- [ ] Photo uploads function correctly
- [ ] Vote submission and results display
- [ ] Export features (students, results) work
- [ ] localStorage persists across page refresh
- [ ] Responsive design works on mobile
- [ ] No console errors in browser DevTools

## Further Optimization (Optional)

1. **Code Splitting**: Enable dynamic imports for large features
2. **Asset Optimization**: Compress candidate photos to <100KB each
3. **Caching Strategy**: Configure cache headers in Lovable
4. **Analytics**: Add Lovable analytics dashboard integration
5. **Custom Branding**: Add custom favicon and meta tags (already done)

## Support

For deployment issues specific to Lovable:
- Visit [Lovable Documentation](https://docs.lovable.dev)
- Contact Lovable support team

For application-specific issues:
- Review README.md troubleshooting section
- Check browser console and network tab (F12)
- Test locally with `npm run dev` to isolate issues

---

**Last Updated**: 2024  
**Lovable Version**: Compatible with current Lovable platform  
**App Version**: 1.0.0
