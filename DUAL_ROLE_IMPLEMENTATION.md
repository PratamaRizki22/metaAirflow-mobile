# Dual Role System Implementation

## Overview
Implementasi sistem dual role (Tenant & Landlord) tanpa perubahan backend, menggunakan client-side flag.

## Flow Diagram

```
User Install App
    |
    v
Default: TENANT (dapat browse & booking)
    |
    v
Login/Register
    |
    v
Profile Screen
    |
    +-- Belum Landlord? --> "Menjadi Tuan Rumah" Card
    |                           |
    |                           v
    |                      BecomeHostScreen
    |                           |
    |                           v
    |                      Activate Hosting (client-side)
    |                           |
    |                           v
    |                      isLandlord = true
    |
    +-- Sudah Landlord? --> "Dashboard Hosting" Link
                                |
                                v
                           HostingDashboardScreen
                                |
                                +-- Lihat Properties
                                +-- Terima/Tolak Booking
                                +-- Tambah Property
```

## Files Modified

### 1. AuthContext.tsx
- Added `isLandlord` field to User interface (client-side flag)
- Added `activateHosting()` method to activate landlord features
- No backend call needed - just updates AsyncStorage

### 2. ProfileScreen.tsx
- Added "Menjadi Tuan Rumah" card (only for non-landlords)
- Added "Dashboard Hosting" link (only for landlords)
- Conditional rendering based on `user.isLandlord`

## New Screens Created

### 1. BecomeHostScreen.tsx
**Location:** `/screens/hosting/BecomeHostScreen.tsx`

**Purpose:** Activate landlord features

**Features:**
- Explains hosting benefits
- Simulates module download (1.5 seconds)
- Calls `activateHosting()` from AuthContext
- Redirects to main screen after activation

**Usage:**
```typescript
navigation.navigate('BecomeHost');
```

### 2. HostingDashboardScreen.tsx
**Location:** `/screens/hosting/HostingDashboardScreen.tsx`

**Purpose:** Landlord dashboard for managing properties and bookings

**Features:**
- Shows property count and pending booking requests
- Lists all user's properties
- Lists pending booking requests
- Approve/Reject booking functionality
- Link to create new property

**Backend Endpoints Used:**
- `GET /api/v1/m/users/properties` - Get my properties
- `GET /api/v1/m/bookings?role=owner&status=PENDING` - Get booking requests
- `POST /api/v1/m/bookings/:id/approve` - Approve booking
- `POST /api/v1/m/bookings/:id/reject` - Reject booking

## User Journey

### Scenario 1: New User (Tenant Only)
1. Install app
2. Browse properties
3. Create booking
4. View "My Trips"

### Scenario 2: Become a Landlord
1. Login
2. Go to Profile
3. See "Menjadi Tuan Rumah" card
4. Click "Mulai Sekarang"
5. Confirm activation
6. Wait for "download" (1.5s simulation)
7. Success! Now has landlord features

### Scenario 3: Existing Landlord
1. Login (isLandlord already true from previous session)
2. Go to Profile
3. See "Dashboard Hosting" link
4. Click to view hosting dashboard
5. Manage properties and bookings

## Backend Requirements

**NONE!** Backend sudah support semua yang diperlukan:

- ✅ User bisa create property → Auto jadi landlord
- ✅ Bookings punya role filter (tenant/owner)
- ✅ Properties punya owner field
- ✅ Approve/Reject booking endpoints

## Key Features

### Client-Side Flag
```typescript
interface User {
  // ... other fields
  isLandlord?: boolean;  // Stored in AsyncStorage
}
```

### Activation Method
```typescript
const activateHosting = async () => {
  const updatedUser = { ...user, isLandlord: true };
  setUser(updatedUser);
  await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
};
```

### Conditional Rendering
```typescript
// Show for non-landlords
{isLoggedIn && !user?.isLandlord && (
  <BecomeHostCard />
)}

// Show for landlords
{isLoggedIn && user?.isLandlord && (
  <HostingDashboardLink />
)}
```

## Testing Checklist

### As Tenant
- [ ] Can browse properties
- [ ] Can create booking
- [ ] Can view "My Trips"
- [ ] See "Menjadi Tuan Rumah" card in Profile

### Become Landlord
- [ ] Click "Mulai Sekarang" button
- [ ] See activation confirmation dialog
- [ ] See loading state (1.5s)
- [ ] See success message
- [ ] "Menjadi Tuan Rumah" card disappears
- [ ] "Dashboard Hosting" link appears

### As Landlord
- [ ] Can access Hosting Dashboard
- [ ] Can see property count
- [ ] Can see booking requests
- [ ] Can approve booking
- [ ] Can reject booking
- [ ] Can navigate to create property
- [ ] STILL can browse and book as tenant

## Next Steps

1. **Add Navigation Routes:**
   - Add `BecomeHost` screen to navigation
   - Add `HostingDashboard` screen to navigation

2. **Create Property Screen:**
   - Build form for creating new property
   - Use `propertyService.createProperty()`

3. **Enhance Hosting Dashboard:**
   - Add statistics (revenue, occupancy rate)
   - Add calendar view for bookings
   - Add messaging with tenants

4. **Optional: Code Splitting:**
   - Use React.lazy() for hosting screens
   - Reduce initial bundle size
   - Load hosting module on-demand

## Notes

- No backend changes required
- All logic is client-side
- Backend endpoints already support dual role
- User can be both tenant AND landlord simultaneously
- isLandlord flag persists in AsyncStorage
