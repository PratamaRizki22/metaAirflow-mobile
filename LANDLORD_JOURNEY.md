# Landlord Journey - Screen Implementation

## Overview
Complete UX flow untuk landlord (pemilik) - dari dashboard sampai manage bookings.

## Flow Diagram

```
HostingDashboardScreen
    |
    +-- View Stats (properties, bookings)
    |
    +-- Create Property
    |       |
    |       v
    |   CreatePropertyScreen
    |       |
    |       v
    |   Back to Dashboard
    |
    +-- Manage Properties
    |       |
    |       v
    |   ManagePropertiesScreen
    |       |
    |       +-- View Property
    |       +-- Delete Property
    |
    +-- Approve/Reject Bookings
            |
            v
        Booking Updated
```

## Screens Created

### 1. HostingDashboardScreen (Already Exists)
**File:** `/screens/hosting/HostingDashboardScreen.tsx`

**Purpose:** Main dashboard for landlords

**Features:**
- Show property count
- Show pending booking requests count
- List pending booking requests
- Approve/Reject bookings
- Link to Create Property
- Link to Manage Properties
- List all properties (summary)

**API Used:**
- `GET /api/v1/m/users/properties` - Get my properties
- `GET /api/v1/m/bookings?role=owner&status=PENDING` - Get booking requests
- `POST /api/v1/m/bookings/:id/approve` - Approve booking
- `POST /api/v1/m/bookings/:id/reject` - Reject booking

**Navigation:**
```typescript
navigation.navigate('CreateProperty');
navigation.navigate('ManageProperties');
```

---

### 2. CreatePropertyScreen
**File:** `/screens/landlord/CreatePropertyScreen.tsx`

**Purpose:** Add new property

**Features:**
- Input property details:
  - Title
  - Description
  - Address (street, city, state, zip)
  - Price (monthly)
  - Bedrooms, Bathrooms, Area
  - Property Type (select from list)
  - Furnished (checkbox)
- Form validation
- Load property types from API
- Submit to create property

**API Used:**
- `GET /api/v1/property-types` - Get property types
- `POST /api/v1/properties` - Create property

**Validation:**
- All required fields filled
- Price > 0
- Bedrooms, Bathrooms, Area > 0
- Property type selected

**Navigation After Success:**
```typescript
navigation.navigate('HostingDashboard');
```

---

### 3. ManagePropertiesScreen
**File:** `/screens/landlord/ManagePropertiesScreen.tsx`

**Purpose:** View and manage all properties

**Features:**
- List all landlord's properties
- Show property status (ACTIVE, PENDING_REVIEW, INACTIVE, REJECTED)
- Color-coded status badges
- View property detail
- Delete property
- Add new property button
- Empty state with "Add First Property" button

**API Used:**
- `GET /api/v1/m/users/properties` - Get my properties
- `DELETE /api/v1/properties/:id` - Delete property

**Status Colors:**
- ACTIVE: Green (#34C759)
- PENDING_REVIEW: Orange (#FF9500)
- INACTIVE: Gray (#999)
- REJECTED: Red (#FF3B30)

**Navigation:**
```typescript
navigation.navigate('PropertyDetail', { propertyId });
navigation.navigate('CreateProperty');
```

---

## Complete Landlord Journey

### Scenario 1: New Landlord (First Property)

1. **Activate Hosting**
   - Click "Menjadi Tuan Rumah" in Profile
   - Activate hosting features
   - Redirected to main screen

2. **Access Dashboard**
   - Click "Dashboard Hosting" in Profile
   - See HostingDashboardScreen
   - Stats show: 0 properties, 0 bookings

3. **Create First Property**
   - Click "Tambah Properti Baru"
   - Fill property form:
     - Title: "Modern Apartment in KLCC"
     - Description: "Beautiful 3BR apartment..."
     - Address: "Jalan Ampang, Kuala Lumpur, KL, 50450"
     - Price: 8000000
     - Bedrooms: 3, Bathrooms: 2, Area: 120
     - Type: Apartment
     - Furnished: Yes
   - Submit
   - Success! Redirected to Dashboard

4. **View Properties**
   - Click "Kelola Semua Properti"
   - See property listed
   - Status: PENDING_REVIEW (waiting admin approval)

---

### Scenario 2: Manage Bookings

1. **Receive Booking Request**
   - Tenant creates booking
   - Notification appears (future feature)
   - Dashboard shows: 1 pending request

2. **Review Request**
   - See booking details:
     - Property: Modern Apartment
     - Check-in: 2025-01-15
     - Check-out: 2025-02-15
     - Status: PENDING

3. **Approve Booking**
   - Click "Setujui" button
   - Booking status → APPROVED
   - Tenant notified (future feature)

4. **Or Reject Booking**
   - Click "Tolak" button
   - Reason: "Property not available"
   - Booking status → REJECTED

---

### Scenario 3: Manage Multiple Properties

1. **View All Properties**
   - Go to ManagePropertiesScreen
   - See list of all properties
   - Each shows: title, location, price, status

2. **Delete Property**
   - Click "Delete" on property
   - Confirm deletion
   - Property removed from list

3. **Add More Properties**
   - Click "+ Add" button
   - Fill form for new property
   - Submit

---

## API Integration Summary

| Screen | Endpoints Used | Methods |
|--------|---------------|---------|
| HostingDashboard | `/api/v1/m/users/properties`<br>`/api/v1/m/bookings?role=owner`<br>`/api/v1/m/bookings/:id/approve`<br>`/api/v1/m/bookings/:id/reject` | `getMyProperties()`<br>`getOwnerBookings()`<br>`approveBooking()`<br>`rejectBooking()` |
| CreateProperty | `/api/v1/property-types`<br>`/api/v1/properties` | `getPropertyTypes()`<br>`createProperty()` |
| ManageProperties | `/api/v1/m/users/properties`<br>`/api/v1/properties/:id` | `getMyProperties()`<br>`deleteProperty()` |

---

## Navigation Routes Needed

Add these routes to your navigation:

```typescript
// Landlord screens
<Stack.Screen name="HostingDashboard" component={HostingDashboardScreen} />
<Stack.Screen name="CreateProperty" component={CreatePropertyScreen} />
<Stack.Screen name="ManageProperties" component={ManagePropertiesScreen} />
```

---

## Testing Checklist

### HostingDashboard
- [ ] Stats display correctly
- [ ] Booking requests load
- [ ] Approve booking works
- [ ] Reject booking works
- [ ] Navigate to CreateProperty
- [ ] Navigate to ManageProperties

### CreateProperty
- [ ] Form validation works
- [ ] Property types load
- [ ] Property type selection works
- [ ] Furnished checkbox works
- [ ] Submit creates property
- [ ] Navigate back after success

### ManageProperties
- [ ] Properties load correctly
- [ ] Status badges show correct colors
- [ ] View property navigates correctly
- [ ] Delete property works
- [ ] Add button navigates to CreateProperty
- [ ] Empty state shows when no properties

---

## Form Validation Rules

### CreatePropertyScreen
- Title: Required, min 5 characters
- Description: Required, min 20 characters
- Address: Required
- City, State: Required
- Price: Required, > 0
- Bedrooms: Required, > 0
- Bathrooms: Required, > 0
- Area: Required, > 0
- Property Type: Required (must select one)

---

## Next Steps

1. **Add Image Upload:**
   - Use uploadService for property images
   - Multiple image support
   - Image preview

2. **Add Amenities Selection:**
   - Load amenities from API
   - Multi-select checkboxes
   - Save amenity IDs

3. **Add Edit Property:**
   - EditPropertyScreen
   - Pre-fill form with existing data
   - Update property

4. **Enhance Dashboard:**
   - Revenue statistics
   - Occupancy rate
   - Calendar view
   - Charts/graphs

5. **Add Messaging:**
   - Chat with tenants
   - Booking discussions
   - Notifications

---

## Notes

- All screens focus on UX/flow, minimal styling
- All API calls use existing services
- No backend changes needed
- Ready for navigation integration
- Can add styling later
- Image upload TODO (use uploadService)
