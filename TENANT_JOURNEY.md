# Tenant Journey - Screen Implementation

## Overview
Complete UX flow untuk tenant (penyewa) - dari explore sampai booking.

## Flow Diagram

```
ExploreScreen
    |
    | (Click property)
    v
PropertyDetailScreen
    |
    +-- Add to Favorites
    |
    | (Click "Book Now")
    v
CreateBookingScreen
    |
    | (Submit booking)
    v
MyTripsScreen
    |
    +-- View all bookings
    +-- Filter by status
    +-- Cancel booking
```

## Screens Created

### 1. ExploreScreen
**File:** `/screens/tenant/ExploreScreen.tsx`

**Purpose:** Browse and search properties

**Features:**
- List all available properties
- Search by keyword
- Click property to view detail

**API Used:**
- `GET /api/v1/m/properties` - List properties with search

**Navigation:**
```typescript
navigation.navigate('PropertyDetail', { propertyId });
```

---

### 2. PropertyDetailScreen
**File:** `/screens/tenant/PropertyDetailScreen.tsx`

**Purpose:** View property details and book

**Features:**
- Show property info (title, price, location, description)
- Show bedrooms, bathrooms, area
- List amenities
- Show owner info
- Toggle favorite (add/remove)
- Book now button

**API Used:**
- `GET /api/v1/properties/:id` - Get property detail
- `GET /api/v1/m/users/favorites/:id/check` - Check if favorited
- `POST /api/v1/m/properties/:id/favorite` - Toggle favorite

**Navigation:**
```typescript
// To booking
navigation.navigate('CreateBooking', {
  propertyId,
  propertyTitle,
  price
});
```

---

### 3. CreateBookingScreen
**File:** `/screens/tenant/CreateBookingScreen.tsx`

**Purpose:** Create booking request

**Features:**
- Input start date (YYYY-MM-DD format)
- Input end date (YYYY-MM-DD format)
- Date validation (not in past, end > start)
- Calculate duration (days)
- Calculate total price
- Optional message to owner
- Submit booking request

**API Used:**
- `POST /api/v1/m/bookings` - Create booking

**Validation:**
- Date format: YYYY-MM-DD
- Start date not in past
- End date after start date
- Minimum 1 day duration

**Navigation After Success:**
```typescript
navigation.navigate('MyTrips');
```

---

### 4. MyTripsScreen
**File:** `/screens/tenant/MyTripsScreen.tsx`

**Purpose:** View and manage tenant bookings

**Features:**
- List all bookings as tenant
- Filter by status (ALL, PENDING, APPROVED, COMPLETED)
- Show booking details (property, dates, status, price)
- Cancel booking (for PENDING/APPROVED status)
- Color-coded status badges

**API Used:**
- `GET /api/v1/m/bookings?role=tenant&status=X` - Get tenant bookings
- `POST /api/v1/m/bookings/:id/cancel` - Cancel booking

**Status Colors:**
- PENDING: Orange (#FF9500)
- APPROVED: Green (#34C759)
- REJECTED: Red (#FF3B30)
- CANCELLED: Gray (#999)
- COMPLETED: Blue (#007AFF)

---

## Complete User Journey

### Scenario: User wants to rent a property

1. **Browse Properties**
   - Open app → ExploreScreen
   - See list of properties
   - Use search to find specific property
   - Click property card

2. **View Details**
   - See PropertyDetailScreen
   - Read description, check amenities
   - Add to favorites (optional)
   - Click "Book Now"

3. **Create Booking**
   - Enter start date (e.g., 2025-01-15)
   - Enter end date (e.g., 2025-02-15)
   - See duration: 31 days
   - See total price calculated
   - Write message to owner (optional)
   - Submit booking request

4. **Track Booking**
   - Go to MyTripsScreen
   - See booking status: PENDING
   - Wait for owner approval
   - Status changes to APPROVED
   - Can cancel if needed

---

## API Integration Summary

| Screen | Endpoints Used | Methods |
|--------|---------------|---------|
| ExploreScreen | `/api/v1/m/properties` | `getMobileProperties()` |
| PropertyDetailScreen | `/api/v1/properties/:id`<br>`/api/v1/m/users/favorites/:id/check`<br>`/api/v1/m/properties/:id/favorite` | `getPropertyById()`<br>`isFavorited()`<br>`toggleFavorite()` |
| CreateBookingScreen | `/api/v1/m/bookings` | `createBooking()` |
| MyTripsScreen | `/api/v1/m/bookings?role=tenant`<br>`/api/v1/m/bookings/:id/cancel` | `getTenantBookings()`<br>`cancelBooking()` |

---

## Navigation Routes Needed

Add these routes to your navigation:

```typescript
// Tenant screens
<Stack.Screen name="Explore" component={ExploreScreen} />
<Stack.Screen name="PropertyDetail" component={PropertyDetailScreen} />
<Stack.Screen name="CreateBooking" component={CreateBookingScreen} />
<Stack.Screen name="MyTrips" component={MyTripsScreen} />
```

---

## Testing Checklist

### ExploreScreen
- [ ] Properties load on screen open
- [ ] Search works correctly
- [ ] Click property navigates to detail

### PropertyDetailScreen
- [ ] Property details display correctly
- [ ] Favorite toggle works (logged in)
- [ ] Favorite requires login (guest)
- [ ] Book now navigates to booking screen

### CreateBookingScreen
- [ ] Date validation works
- [ ] Duration calculates correctly
- [ ] Total price calculates correctly
- [ ] Submit creates booking
- [ ] Navigates to MyTrips after success

### MyTripsScreen
- [ ] Bookings load correctly
- [ ] Filter tabs work
- [ ] Status colors display correctly
- [ ] Cancel booking works
- [ ] Refresh after cancel

---

## Next Steps

1. **Add to Navigation:**
   - Register all 4 screens in navigation
   - Set up proper stack/tab structure

2. **Add Images:**
   - Property images in detail screen
   - Use upload service for property photos

3. **Enhance UX:**
   - Add loading states
   - Add empty states
   - Add error handling
   - Add pull-to-refresh

4. **Optional Improvements:**
   - Date picker component (instead of text input)
   - Image carousel for property photos
   - Map view for property location
   - Review/rating system

---

## Notes

- All screens focus on UX/flow, minimal styling
- All API calls use existing services
- No backend changes needed
- Ready for navigation integration
- Can add styling later
