# New Context Implementation Guide

This document explains how to use the newly implemented contexts: **FavoritesContext**, **NotificationContext**, and **SearchContext**.

---

## 📋 Table of Contents

1. [FavoritesContext](#favoritescontext)
2. [NotificationContext](#notificationcontext)
3. [SearchContext](#searchcontext)
4. [Integration Examples](#integration-examples)

---

## 1. FavoritesContext

### Purpose
Centralized favorite management with optimistic updates and real-time sync across screens.

### Features
- ✅ Optimistic UI updates (instant feedback)
- ✅ Auto-sync across all screens
- ✅ Offline caching with AsyncStorage
- ✅ Automatic rollback on error

### Usage

```tsx
import { useFavorites } from '../contexts/FavoritesContext';

function PropertyDetailScreen() {
    const { isFavorited, toggleFavorite, loading } = useFavorites();
    const propertyId = '123';

    const handleToggleFavorite = async () => {
        try {
            await toggleFavorite(propertyId);
            // UI updates automatically!
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <TouchableOpacity onPress={handleToggleFavorite}>
            <Ionicons 
                name={isFavorited(propertyId) ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorited(propertyId) ? '#EF4444' : '#9CA3AF'}
            />
        </TouchableOpacity>
    );
}
```

### API Reference

```typescript
interface FavoritesContextType {
    favorites: Set<string>;              // Set of favorited property IDs
    isFavorited: (propertyId: string) => boolean;  // Check if favorited
    toggleFavorite: (propertyId: string) => Promise<void>;  // Toggle favorite
    refreshFavorites: () => Promise<void>;  // Refresh from server
    loading: boolean;                    // Loading state
    error: string | null;                // Error message
}
```

### Example: Update FavoritesScreen

```tsx
// Before: Fetching favorites in component
const [favorites, setFavorites] = useState([]);
useEffect(() => {
    loadFavorites(); // API call
}, []);

// After: Using context
const { favorites, isFavorited, toggleFavorite } = useFavorites();
// Favorites automatically sync!
```

---

## 2. NotificationContext

### Purpose
Centralized notification management with unread count tracking.

### Features
- ✅ Real unread count
- ✅ Mark as read/unread
- ✅ Delete notifications
- ✅ Ready for push notification integration

### Usage

```tsx
import { useNotifications } from '../contexts/NotificationContext';

function HomeScreen() {
    const { unreadCount } = useNotifications();

    return (
        <View>
            <Ionicons name="notifications-outline" size={24} />
            {unreadCount > 0 && (
                <View className="badge">
                    <Text>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
            )}
        </View>
    );
}
```

### API Reference

```typescript
interface NotificationContextType {
    notifications: Notification[];       // All notifications
    unreadCount: number;                 // Unread count
    loading: boolean;                    // Loading state
    markAsRead: (id: string) => Promise<void>;  // Mark one as read
    markAllAsRead: () => Promise<void>;  // Mark all as read
    deleteNotification: (id: string) => Promise<void>;  // Delete one
    clearAll: () => Promise<void>;       // Clear all
    refreshNotifications: () => Promise<void>;  // Refresh
    addNotification: (notification) => void;  // Add new (for real-time)
}

interface Notification {
    id: string;
    type: 'booking' | 'message' | 'review' | 'payment' | 'system';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    data?: any;
}
```

### Example: Notifications Screen

```tsx
function NotificationsScreen() {
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead,
        deleteNotification 
    } = useNotifications();

    return (
        <View>
            <Text>Notifications ({unreadCount} unread)</Text>
            <TouchableOpacity onPress={markAllAsRead}>
                <Text>Mark All as Read</Text>
            </TouchableOpacity>

            <FlatList
                data={notifications}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        onPress={() => markAsRead(item.id)}
                        style={{ opacity: item.read ? 0.5 : 1 }}
                    >
                        <Text>{item.title}</Text>
                        <Text>{item.message}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}
```

---

## 3. SearchContext

### Purpose
Manage search history, saved filters, and current search state.

### Features
- ✅ Recent searches (max 10)
- ✅ Saved filter presets
- ✅ Persistent current filters
- ✅ Quick filter application

### Usage

```tsx
import { useSearch } from '../contexts/SearchContext';

function SearchScreen() {
    const { 
        recentSearches, 
        addRecentSearch,
        currentFilters,
        setCurrentFilters,
        savedFilters,
        saveFilter 
    } = useSearch();

    const handleSearch = (query: string) => {
        addRecentSearch(query);  // Auto-save to history
        setCurrentFilters({ ...currentFilters, search: query });
    };

    const handleSaveFilter = () => {
        saveFilter('My Favorite Search', currentFilters);
    };

    return (
        <View>
            {/* Recent Searches */}
            <Text>Recent Searches</Text>
            {recentSearches.map(query => (
                <TouchableOpacity 
                    key={query}
                    onPress={() => handleSearch(query)}
                >
                    <Text>{query}</Text>
                </TouchableOpacity>
            ))}

            {/* Saved Filters */}
            <Text>Saved Filters</Text>
            {savedFilters.map(filter => (
                <TouchableOpacity 
                    key={filter.id}
                    onPress={() => setCurrentFilters(filter.filters)}
                >
                    <Text>{filter.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}
```

### API Reference

```typescript
interface SearchContextType {
    // Recent searches
    recentSearches: string[];
    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;

    // Saved filters
    savedFilters: SavedFilter[];
    saveFilter: (name: string, filters: PropertyFilters) => void;
    deleteFilter: (id: string) => void;
    applyFilter: (id: string) => PropertyFilters | null;

    // Current state
    currentFilters: PropertyFilters;
    setCurrentFilters: (filters: PropertyFilters) => void;
    clearCurrentFilters: () => void;
    hasActiveFilters: boolean;
}
```

---

## 4. Integration Examples

### Example 1: PropertyCard with Favorite

```tsx
import { useFavorites } from '../contexts';

function PropertyCard({ property }: { property: Property }) {
    const { isFavorited, toggleFavorite } = useFavorites();

    return (
        <View>
            <Image source={{ uri: property.image }} />
            <TouchableOpacity 
                onPress={() => toggleFavorite(property.id)}
                style={{ position: 'absolute', top: 10, right: 10 }}
            >
                <Ionicons 
                    name={isFavorited(property.id) ? 'heart' : 'heart-outline'}
                    size={28}
                    color={isFavorited(property.id) ? '#EF4444' : '#FFF'}
                />
            </TouchableOpacity>
            <Text>{property.title}</Text>
        </View>
    );
}
```

### Example 2: Search with History

```tsx
import { useSearch } from '../contexts';

function SearchBar() {
    const { recentSearches, addRecentSearch } = useSearch();
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSearch = () => {
        if (query.trim()) {
            addRecentSearch(query);
            // Perform search...
        }
    };

    return (
        <View>
            <TextInput
                value={query}
                onChangeText={setQuery}
                onFocus={() => setShowSuggestions(true)}
                onSubmitEditing={handleSearch}
                placeholder="Search properties..."
            />

            {showSuggestions && recentSearches.length > 0 && (
                <View>
                    {recentSearches.map(search => (
                        <TouchableOpacity 
                            key={search}
                            onPress={() => {
                                setQuery(search);
                                handleSearch();
                            }}
                        >
                            <Ionicons name="time-outline" size={16} />
                            <Text>{search}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
}
```

### Example 3: Notification Bell with Badge

```tsx
import { useNotifications } from '../contexts';

function NotificationBell({ navigation }) {
    const { unreadCount } = useNotifications();

    return (
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} />
            {unreadCount > 0 && (
                <View style={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    backgroundColor: '#EF4444',
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
```

---

## 🎯 Migration Checklist

### FavoritesContext
- [ ] Update `FavoritesScreen.tsx` to use `useFavorites()`
- [ ] Add favorite button to `PropertyCard.tsx`
- [ ] Add favorite button to `PropertyDetailScreen.tsx`
- [ ] Remove local favorite state from components

### NotificationContext
- [ ] Update notification icon in `HomeScreen.tsx` ✅ (Done)
- [ ] Create `NotificationsScreen.tsx` (if not exists)
- [ ] Integrate push notifications (future)

### SearchContext
- [ ] Update `SearchScreen.tsx` to use `useSearch()`
- [ ] Add recent searches UI
- [ ] Add saved filters UI
- [ ] Persist filters when navigating away

---

## 🚀 Next Steps

1. **Implement ChatContext** for real-time messaging
2. **Implement BookingDraftContext** for auto-save booking progress
3. **Implement LocationContext** for location-based features
4. **Add WebSocket** integration for real-time updates

---

## 📝 Notes

- All contexts use AsyncStorage for persistence
- Contexts are wrapped in App.tsx in the correct order
- Optimistic updates provide instant UI feedback
- Error handling with automatic rollback
- Ready for backend API integration

---

**Created:** 2025-12-26  
**Version:** 1.0.0
