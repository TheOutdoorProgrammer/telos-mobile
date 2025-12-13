# Publishing Guide

This document explains how to publish Telos Mobile to app stores using the automated GitHub Actions workflows.

## Overview

The publishing pipeline consists of two workflows:

1. **Publish App** (`publish.yml`) - Automatically triggers on version tags, builds the app for iOS and Android
2. **Submit to App Stores** (`submit-stores.yml`) - Manual workflow to submit builds to App Store and Play Store

## Prerequisites

### 1. Expo Account Setup

You need an Expo account with EAS (Expo Application Services) enabled:

1. Create an account at [expo.dev](https://expo.dev)
2. Install EAS CLI locally: `npm install -g eas-cli`
3. Login: `eas login`

### 2. Create an Expo Access Token

Generate an access token for GitHub Actions:

```bash
eas token:create --type automation
```

Add this token to your GitHub repository secrets as `EXPO_TOKEN`:
- Go to your repo → Settings → Secrets and variables → Actions
- Click "New repository secret"
- Name: `EXPO_TOKEN`
- Value: [your token]

### 3. iOS Setup (Optional for App Store)

For App Store submission, you need:

1. **Apple Developer Account** ($99/year)
2. **App Store Connect API Key**:
   - Go to App Store Connect → Users and Access → Keys
   - Create a new API key with "Admin" access
   - Download the `.p8` file

3. **Update `eas.json`** with your Apple credentials:
   ```json
   "submit": {
     "production": {
       "ios": {
         "appleId": "your-apple-id@example.com",
         "ascAppId": "your-app-store-connect-app-id",
         "appleTeamId": "your-team-id"
       }
     }
   }
   ```

4. **Configure EAS for iOS**:
   ```bash
   eas credentials:configure --platform ios
   ```
   This will guide you through setting up signing certificates and provisioning profiles.

### 4. Android Setup (Optional for Play Store)

For Play Store submission, you need:

1. **Google Play Developer Account** ($25 one-time fee)
2. **Service Account Key**:
   - Go to Google Cloud Console
   - Create a service account with "Release Manager" permissions
   - Download the JSON key file
   - Store it in your project as `playstore-service-account.json` (add to `.gitignore`)

3. **Configure EAS for Android**:
   ```bash
   eas credentials:configure --platform android
   ```
   This will help you set up keystores for signing.

## Publishing Process

### Automated Publishing (Recommended)

1. **Update version in `app.json`**:
   ```json
   {
     "expo": {
       "version": "1.1.0"
     }
   }
   ```

2. **Commit and create a tag**:
   ```bash
   git add app.json
   git commit -m "chore: bump version to 1.1.0"
   git tag v1.1.0
   git push origin main --tags
   ```

3. **Monitor the build**:
   - GitHub Actions will automatically trigger
   - Builds are submitted to EAS Build
   - A GitHub release will be created
   - Monitor builds at: `https://expo.dev/accounts/[your-account]/projects/telos/builds`

4. **Submit to stores (optional)**:
   Once builds complete, go to GitHub Actions and run the "Submit to App Stores" workflow:
   - Actions → Submit to App Stores → Run workflow
   - Select platform (iOS, Android, or both)

### Manual Publishing

If you prefer manual control:

```bash
# Build for production
eas build --platform ios --profile production
eas build --platform android --profile production

# After builds complete, submit to stores
eas submit --platform ios --profile production --latest
eas submit --platform android --profile production --latest
```

## Build Profiles

The `eas.json` defines three build profiles:

- **development**: For local development with Expo Go
- **preview**: Internal testing builds (iOS simulator, Android APK)
- **production**: Release builds for app stores (iOS App Store, Android App Bundle)

## Troubleshooting

### Build Fails with "Invalid credentials"

Ensure you've configured credentials for the platform:
```bash
eas credentials:configure --platform ios
eas credentials:configure --platform android
```

### "EXPO_TOKEN not found" error

Make sure you've added the `EXPO_TOKEN` secret to your GitHub repository settings.

### iOS build succeeds but submission fails

1. Verify your App Store Connect API key is correctly configured
2. Ensure the app is created in App Store Connect
3. Check that your Apple Developer account is in good standing

### Android submission fails

1. Verify the service account has "Release Manager" permissions in Play Console
2. Ensure the app is created in Google Play Console
3. Check that the service account JSON key is valid

## Over-the-Air (OTA) Updates

EAS Update allows you to push updates without going through app stores:

```bash
# Publish an update
eas update --branch production --message "Fix critical bug"
```

Configure automatic updates by adding to `app.json`:
```json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD",
      "fallbackToCacheTimeout": 0
    }
  }
}
```

## Cost Considerations

- **EAS Build**: Free tier includes limited builds per month, paid plans for more
- **EAS Submit**: Included with EAS Build
- **EAS Update**: Free tier available, paid plans for higher usage
- **Apple Developer**: $99/year
- **Google Play Developer**: $25 one-time

Check current pricing at [expo.dev/pricing](https://expo.dev/pricing)

## Security Best Practices

1. **Never commit credentials**: Keep `.p8` files and service account JSONs out of git
2. **Use GitHub secrets**: Store sensitive values as GitHub Actions secrets
3. **Rotate tokens**: Periodically regenerate your `EXPO_TOKEN`
4. **Review permissions**: Ensure service accounts have minimum required permissions

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [iOS App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Publishing Guidelines](https://play.google.com/console/about/guides/releasewithconfidence/)
