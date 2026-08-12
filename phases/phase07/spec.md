# Phase 07 Spec - Payments, Social Sign-In, and Notifications

## Goal
Integrate production-grade account entry, monetization, and engagement features after the core app flow is stable in device testing.

This phase covers:
- Google sign-in.
- Apple sign-in.
- Mobile subscription/payment integration.
- Push notifications.
- Backend ownership of auth, entitlements, and notification state.

## Screens
- Auth Screen updates for Google and Apple sign-in.
- Premium Screen updates for real purchase plans.
- Settings Screen updates for notification preferences and restore purchase.
- Any required permission prompt or notification preference UI.

## Functional Requirements

### Google Sign-In
- Add Google sign-in on supported platforms.
- Verify Google identity tokens on the backend.
- Create a user account if the Google identity is new.
- Link Google identity to an existing account only with explicit product rules.
- Return the same app session format used by email/password login.
- Do not trust client-provided email/name without backend token verification.

### Apple Sign-In
- Add Apple sign-in for iOS.
- Support Apple private relay email behavior.
- Verify Apple identity tokens on the backend.
- Store the stable Apple subject identifier.
- Create a user account if the Apple identity is new.
- Return the same app session format used by email/password login.
- Apple sign-in should be available anywhere required by App Store policy if other social login methods are offered.

### Payments
- Use platform-compliant in-app purchases for digital premium features.
- Android must use Google Play Billing or a compliant wrapper such as RevenueCat.
- iOS must use StoreKit or a compliant wrapper such as RevenueCat.
- Backend must own premium entitlement state.
- Frontend must not unlock premium based only on local purchase success.
- Add restore purchase action.
- Add handling for active, expired, cancelled, refunded, grace-period, and billing-retry states.
- Add clear premium plan copy and billing terms before purchase.

### Notifications
- Add push notification permission flow.
- Add notification opt-in/out settings.
- Register device push tokens with the backend.
- Support token refresh.
- Send only motivational or account-relevant notifications.
- Do not use fear-based notification copy.
- Do not request notification permission before the app has context for why it is needed.

## Backend Requirements

### Auth
- Add provider identity fields or a linked identities table.
- Add routes for social auth:
  - `POST /auth/google`
  - `POST /auth/apple`
- Verify provider tokens server-side.
- Keep existing email/password login working.
- Prevent duplicate accounts where the same provider identity signs in repeatedly.
- Decide whether same-email provider accounts should auto-link or require explicit linking.

### Entitlements
- Add subscription/entitlement storage.
- Add routes:
  - `GET /subscriptions/me`
  - `POST /subscriptions/restore`
  - provider webhook route, based on chosen payment provider
- Validate purchases server-side.
- Persist entitlement source, product id, status, expiry date, and last verification time.
- Treat webhooks as idempotent.

### Notifications
- Add push token storage tied to user id and platform.
- Add routes:
  - `POST /notifications/register-token`
  - `PATCH /notifications/preferences`
  - `GET /notifications/preferences`
- Store user notification preferences.
- Avoid duplicate tokens for the same device/user.
- Remove invalid tokens when push providers reject them.

## Provider Decisions Required Before Implementation

Do not start implementation until these are selected:
- Payment provider:
  - RevenueCat
  - native Google Play Billing + StoreKit
  - another compliant provider
- Push provider:
  - Expo push notifications
  - Firebase Cloud Messaging directly
  - another provider
- Social sign-in library:
  - Expo AuthSession
  - provider-native libraries
  - another app-compatible option

## Environment And Secrets

Expected new configuration will include:
- Google OAuth client IDs.
- Apple service/app identifiers if backend verification requires them.
- Payment provider API keys.
- Google Play service account key if verifying Android purchases directly.
- App Store Connect API key if automating Apple purchase or submission workflows.
- Push notification credentials.

Rules:
- Do not put private secrets in `EXPO_PUBLIC_*`.
- Frontend may contain public client IDs only where required.
- Backend and CI secrets must live in hosting/CI secret stores.
- Update Play Console and App Store Connect policy answers after permissions/payments are added.

## Policy Requirements

### Google Play
- Update Data safety for:
  - account data
  - purchase data
  - device identifiers or push tokens
  - app activity if analytics are added
- Update App content if notification permissions or sensitive permissions are added.
- Payments must follow Google Play billing policy for digital premium access.

### Apple App Store
- Add Apple sign-in if Google sign-in is offered on iOS and policy requires parity.
- Update privacy nutrition labels for:
  - account identifiers
  - purchases
  - notification tokens or device identifiers
  - analytics/crash data if added
- Payments must follow App Store in-app purchase rules for digital premium access.

## Testing Requirements

### Auth
- New user signs up with Google.
- New user signs up with Apple.
- Existing user signs in again with the same provider.
- Email/password login still works.
- Invalid provider token is rejected.
- Duplicate provider identity does not create duplicate users.

### Payments
- Purchase succeeds on Android.
- Purchase succeeds on iOS.
- Restore purchase works after reinstall.
- Expired subscription removes premium access.
- Cancelled subscription keeps access only until entitlement expiry.
- Refund/revocation removes premium access.
- Backend entitlement and frontend premium UI stay consistent.

### Notifications
- Permission allowed path works.
- Permission denied path works.
- Token registration works after login.
- Notification preferences persist.
- App handles invalid/expired push tokens.
- Notifications open the correct app screen only if deep links are implemented.

## Acceptance Criteria
- Google sign-in works end-to-end.
- Apple sign-in works end-to-end on iOS.
- Premium purchase and restore work on Android and iOS.
- Backend entitlement state is authoritative.
- Notification opt-in, token registration, and preferences work.
- Store policy declarations are updated to match the implemented SDKs and data collection.
- Existing onboarding, setup, progress, achievements, profile, and settings flows still work.

## Out of Scope
- Redesigning existing onboarding or progress screens.
- Replacing the current backend stack.
- Adding analytics unless required for payment or notification debugging.
- Production domain migration, except where provider callbacks require stable URLs.
