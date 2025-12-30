# Toast Implementation - Quick Reference

## Screens Modified & Toast Added

### ✅ COMPLETED
1. **ProfileScreen.tsx** - Logout confirmation (Alert, not toast)

### 🔄 TO IMPLEMENT

## A. Payment & Booking Flow

### 1. CreateBookingScreen.tsx
**Import:**
```typescript
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/common';
```

**Add hook:**
```typescript
const { toast, showToast, hideToast } = useToast();
```

**Changes:**
- Line 91: After booking created → `showToast('Booking created! Proceeding to payment...', 'success')`
- Line 114: On error → `showToast(error.message, 'error')` (replace Alert)

**Add Toast component before closing View:**
```typescript
<Toast
    visible={toast.visible}
    message={toast.message}
    type={toast.type}
    onHide={hideToast}
/>
```

---

### 2. LandlordBookingsScreen.tsx
**Toasts needed:**
- Booking approved: `showToast('Booking approved! Tenant notified', 'success')`
- Booking rejected: `showToast('Booking rejected. Tenant notified', 'info')`
- Error: `showToast(error.message, 'error')`

---

### 3. MyTripsScreen.tsx
**Toasts needed:**
- Cancel booking: `showToast('Booking cancelled successfully', 'success')`
- Error: `showToast(error.message, 'error')`

---

## B. Property Management

### 4. CreatePropertyScreen.tsx
**Toasts needed:**
- Property created: `showToast('Property created! Awaiting approval', 'success')`
- Error: `showToast(error.message, 'error')`

---

### 5. EditPropertyScreen.tsx
**Toasts needed:**
- Property updated: `showToast('Property updated successfully!', 'success')`
- Error: `showToast(error.message, 'error')`

---

### 6. ManagePropertiesScreen.tsx
**Toasts needed:**
- Property deleted: `showToast('Property deleted successfully', 'success')`
- Error: `showToast(error.message, 'error')`

---

## Implementation Priority

**HIGH (Do Now):**
1. CreateBookingScreen - Most critical user flow
2. LandlordBookingsScreen - Important for landlord
3. CreatePropertyScreen - Important for landlord

**MEDIUM (Next):**
4. EditPropertyScreen
5. ManagePropertiesScreen
6. MyTripsScreen

---

## Standard Pattern

```typescript
// 1. Import
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/common';

// 2. Hook
const { toast, showToast, hideToast } = useToast();

// 3. Usage (replace Alert.alert)
try {
    // ... operation
    showToast('Success message', 'success');
} catch (error) {
    showToast(error.message, 'error');
}

// 4. Component (at end of JSX)
<Toast
    visible={toast.visible}
    message={toast.message}
    type={toast.type}
    onHide={hideToast}
/>
```

---

## Note
Toast is better than Alert because:
- ✅ Non-blocking (doesn't stop user flow)
- ✅ Auto-dismisses
- ✅ Better UX (smooth animations)
- ✅ Consistent design
- ❌ Alert should only be used for critical confirmations (logout, delete, etc.)
