# Custom Text Component - Usage Guide

## 📋 Overview

Custom Text component yang otomatis handle **Visby Round font** berdasarkan variant. Ini adalah solusi **clean code** untuk manage typography di seluruh aplikasi.

---

## ✨ Features

- ✅ **Auto font selection** - Tidak perlu manual set `fontFamily`
- ✅ **Semantic variants** - h1, h2, h3, h4, body, caption, button
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Tailwind compatible** - Bisa pakai className
- ✅ **Consistent typography** - Semua header otomatis Bold

---

## 🎯 Basic Usage

### Import
```tsx
import { Text } from '../../components/common';
```

### Headers (Otomatis Bold)
```tsx
// H1 - 32px, VisbyRound-Bold
<Text variant="h1" className="text-primary">
    Today
</Text>

// H2 - 24px, VisbyRound-Bold
<Text variant="h2" className="text-gray-900 dark:text-white">
    Monthly Revenue
</Text>

// H3 - 20px, VisbyRound-Bold
<Text variant="h3">
    Booking Hari Ini
</Text>

// H4 - 18px, VisbyRound-Bold
<Text variant="h4">
    Section Title
</Text>
```

### Body Text
```tsx
// Regular body text - 14px, VisbyRound-Regular
<Text variant="body">
    This is regular text
</Text>

// Bold body text - 14px, VisbyRound-Bold
<Text variant="body" bold>
    This is bold text
</Text>

// Medium body text - 14px, VisbyRound-Medium
<Text variant="body" medium>
    This is medium text
</Text>
```

### Caption & Button
```tsx
// Caption - 12px, VisbyRound-Regular
<Text variant="caption" className="text-gray-500">
    Small caption text
</Text>

// Button text - 16px, VisbyRound-DemiBold
<Text variant="button">
    Click Me
</Text>
```

---

## 📝 Migration Example

### ❌ Before (Manual fontFamily)
```tsx
<Text 
    className="text-3xl mb-2 text-gray-900"
    style={{ fontFamily: 'VisbyRound-Bold' }}
>
    Today
</Text>

<Text 
    className="text-2xl text-gray-900"
    style={{ fontFamily: 'VisbyRound-Bold' }}
>
    {stats.pending}
</Text>
```

### ✅ After (Clean & Semantic)
```tsx
<Text variant="h1" className="mb-2 text-gray-900">
    Today
</Text>

<Text variant="h2" className="text-gray-900">
    {stats.pending}
</Text>
```

---

## 🎨 Font Mapping

| Variant | Font Size | Font Family | Use Case |
|---------|-----------|-------------|----------|
| `h1` | 32px | VisbyRound-Bold | Page titles |
| `h2` | 24px | VisbyRound-Bold | Section headers, stats numbers |
| `h3` | 20px | VisbyRound-Bold | Subsection headers |
| `h4` | 18px | VisbyRound-Bold | Card titles |
| `body` | 14px | VisbyRound-Regular | Default text |
| `body` + `bold` | 14px | VisbyRound-Bold | Emphasized text |
| `body` + `medium` | 14px | VisbyRound-Medium | Semi-bold text |
| `caption` | 12px | VisbyRound-Regular | Small text, labels |
| `button` | 16px | VisbyRound-DemiBold | Button labels |

---

## 🔧 Advanced Usage

### With Tailwind Classes
```tsx
<Text 
    variant="h2" 
    className="text-primary dark:text-primary-light mb-4"
>
    Revenue: RM {amount}
</Text>
```

### With Inline Styles
```tsx
<Text 
    variant="body" 
    style={{ color: '#FF0000', marginTop: 10 }}
>
    Custom styled text
</Text>
```

### With All Props
```tsx
<Text 
    variant="h3"
    className="text-center"
    numberOfLines={2}
    ellipsizeMode="tail"
    onPress={() => console.log('Pressed')}
>
    Long text that will be truncated...
</Text>
```

---

## 💡 Best Practices

### ✅ DO
```tsx
// Use semantic variants
<Text variant="h1">Page Title</Text>
<Text variant="body">Description</Text>

// Combine with Tailwind for colors
<Text variant="h2" className="text-primary">Stats</Text>

// Use bold prop for emphasis
<Text variant="body" bold>Important!</Text>
```

### ❌ DON'T
```tsx
// Don't use fontFamily in style (component handles it)
<Text variant="h1" style={{ fontFamily: 'Arial' }}>Bad</Text>

// Don't use fontSize in style (variant handles it)
<Text variant="body" style={{ fontSize: 20 }}>Bad</Text>

// Don't use font-bold in className (conflicts with custom font)
<Text variant="h1" className="font-bold">Bad</Text>
```

---

## 🚀 Quick Migration Guide

### Step 1: Import Custom Text
```tsx
// Replace React Native Text import
import { Text } from '../../components/common';
```

### Step 2: Replace Headers
```tsx
// Before
<Text className="text-3xl font-bold" style={{ fontFamily: 'VisbyRound-Bold' }}>

// After
<Text variant="h1">
```

### Step 3: Replace Stats/Numbers
```tsx
// Before
<Text className="text-2xl font-bold" style={{ fontFamily: 'VisbyRound-Bold' }}>

// After
<Text variant="h2">
```

### Step 4: Keep Body Text Simple
```tsx
// Before
<Text className="text-sm">Regular text</Text>

// After
<Text variant="body">Regular text</Text>
// or just
<Text>Regular text</Text> // variant="body" is default
```

---

## 📊 Real-World Example

### LandlordTodayScreen
```tsx
export default function LandlordTodayScreen() {
    return (
        <ScrollView>
            <View className="px-6 pt-16 pb-6">
                {/* Page Title */}
                <Text variant="h1" className="mb-2 text-gray-900 dark:text-white">
                    Today
                </Text>
                
                {/* Date */}
                <Text variant="caption" className="text-gray-500 mb-6">
                    {new Date().toLocaleDateString()}
                </Text>

                {/* Stats */}
                <View className="flex-row gap-3">
                    <View className="flex-1 bg-white p-4 rounded-2xl">
                        <Text variant="caption" className="text-gray-500 mb-1">
                            Pending
                        </Text>
                        <Text variant="h2" className="text-gray-900">
                            {stats.pending}
                        </Text>
                    </View>
                </View>

                {/* Section Header */}
                <Text variant="h3" className="mb-4 text-gray-900">
                    Booking Hari Ini
                </Text>

                {/* Body Text */}
                <Text variant="body" className="text-gray-600">
                    Tidak ada booking baru hari ini
                </Text>
            </View>
        </ScrollView>
    );
}
```

---

## ✅ Benefits

1. **Clean Code** - Tidak perlu manual set fontFamily di setiap Text
2. **Consistent** - Semua header otomatis pakai Bold
3. **Maintainable** - Ubah font di satu tempat (Text.tsx)
4. **Type-Safe** - TypeScript autocomplete untuk variants
5. **Scalable** - Mudah tambah variant baru
6. **DRY** - Don't Repeat Yourself

---

## 🎉 Result

**Before:** 10+ lines untuk satu header
```tsx
<Text 
    className="text-3xl font-bold mb-2 text-gray-900 dark:text-white"
    style={{ fontFamily: 'VisbyRound-Bold' }}
>
    Today
</Text>
```

**After:** 3 lines, clean & semantic
```tsx
<Text variant="h1" className="mb-2 text-gray-900 dark:text-white">
    Today
</Text>
```

**Savings:** ~70% less code, 100% more readable! 🚀
