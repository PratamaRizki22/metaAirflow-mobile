# Migration Guide: Replace Text with Custom Text Component

## 🎯 Goal
Replace all React Native Text imports with custom Text component to automatically use Visby Round font.

## 📝 Step-by-Step Migration

### Step 1: Find all files using Text
```bash
grep -r "from 'react-native'" --include="*.tsx" | grep Text
```

### Step 2: Replace imports
**Before:**
```tsx
import { View, Text, ScrollView } from 'react-native';
```

**After:**
```tsx
import { View, ScrollView } from 'react-native';
import { Text } from '../../components/common';
```

### Step 3: Update Text usage
**Before:**
```tsx
<Text className="text-3xl font-bold">Header</Text>
```

**After:**
```tsx
<Text variant="h1">Header</Text>
```

## 🔧 Quick Replace Commands

### For screens in /screens/landlord/
```tsx
// Remove Text from react-native import
import { View, ScrollView } from 'react-native';

// Add Text from custom component
import { Text } from '../../components/common';
```

### For screens in /screens/tabs/
```tsx
// Remove Text from react-native import
import { View, ScrollView } from 'react-native';

// Add Text from custom component
import { Text } from '../../components/common';
```

## 📊 Variant Mapping

| Old className | New variant |
|---------------|-------------|
| `text-3xl font-bold` | `variant="h1"` |
| `text-2xl font-bold` | `variant="h2"` |
| `text-xl font-bold` | `variant="h3"` |
| `text-lg font-bold` | `variant="h4"` |
| `text-base` | `variant="body"` (default) |
| `text-sm` | `variant="body"` |
| `text-xs` | `variant="caption"` |

## ✅ Benefits
- ✅ All headers automatically use VisbyRound-Bold
- ✅ No need to manually set fontFamily
- ✅ Consistent typography across the app
- ✅ Clean code

## 🚀 Priority Files to Migrate

1. `/screens/landlord/LandlordTodayScreen.tsx` ✅ (Done)
2. `/screens/landlord/ManagePropertiesScreen.tsx`
3. `/screens/landlord/LandlordBookingsScreen.tsx`
4. `/screens/landlord/LandlordInboxScreen.tsx`
5. `/screens/tabs/HomeScreen.tsx`
6. `/screens/tabs/ProfileScreen.tsx`
7. All other screens...

## 💡 Tip
Use VSCode Find & Replace:
- Find: `from 'react-native';` (with Text in import)
- Replace manually to split imports
