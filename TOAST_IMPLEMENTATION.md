# Toast Notifications Implementation Guide

## A. Payment Flow Toasts

### 1. CreateBookingScreen.tsx
**Location:** Line 86-117 (handleSubmit function)

**Toasts to add:**
```typescript
// After successful booking creation (line 91)
showToast('success', 'Booking Created!', 'Proceeding to payment...');

// On error (line 114)
showToast('error', 'Booking Failed', error.message);
```

### 2. PaymentScreenWrapper.tsx (or Payment flow)
**Toasts to add:**
```typescript
// Payment processing
showToast('info', 'Processing Payment', 'Please wait...');

// Payment success
showToast('success', 'Payment Successful!', 'Your booking is confirmed');

// Payment failed
showToast('error', 'Payment Failed', 'Please try again');
```

### 3. BookingDetailScreen.tsx (Refund)
**Toasts to add:**
```typescript
// Refund requested
showToast('info', 'Refund Requested', 'We will process your request');

// Refund approved
showToast('success', 'Refund Approved', 'Amount will be credited soon');

// Refund rejected
showToast('error', 'Refund Rejected', reason);
```

---

## B. Booking Flow Toasts

### 1. CreateBookingScreen.tsx
**Already covered in Payment Flow**

### 2. MyTripsScreen.tsx (Tenant)
**Toasts to add:**
```typescript
// Booking approved by landlord
showToast('success', 'Booking Approved!', 'Your trip is confirmed');

// Booking rejected by landlord
showToast('error', 'Booking Rejected', 'Please try another property');
```

### 3. LandlordBookingsScreen.tsx (Landlord)
**Toasts to add:**
```typescript
// New booking received
showToast('info', 'New Booking Request', 'Review and respond');

// Booking approved
showToast('success', 'Booking Approved', 'Tenant has been notified');

// Booking rejected
showToast('info', 'Booking Rejected', 'Tenant has been notified');
```

---

## C. Property Management Toasts

### 1. CreatePropertyScreen.tsx
**Toasts to add:**
```typescript
// Property created
showToast('success', 'Property Created!', 'Awaiting admin approval');

// Creation failed
showToast('error', 'Failed to Create', error.message);
```

### 2. EditPropertyScreen.tsx
**Toasts to add:**
```typescript
// Property updated
showToast('success', 'Property Updated!', 'Changes saved successfully');

// Update failed
showToast('error', 'Update Failed', error.message);
```

### 3. ManagePropertiesScreen.tsx
**Toasts to add:**
```typescript
// Property deleted
showToast('success', 'Property Deleted', 'Listing removed');

// Delete failed
showToast('error', 'Delete Failed', error.message);

// Property approved (from backend notification)
showToast('success', 'Property Approved!', 'Your listing is now live');

// Property rejected (from backend notification)
showToast('error', 'Property Rejected', reason);
```

---

## Implementation Steps

1. Import useToast hook in each file
2. Add toast calls at appropriate locations
3. Replace Alert.alert with showToast where appropriate
4. Test each flow

## Toast Hook Usage

```typescript
import { useToast } from '../../hooks/useToast';

const { showToast } = useToast();

// Usage
showToast(type, title, message);
// type: 'success' | 'error' | 'info' | 'warning'
```
