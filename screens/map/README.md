# Map Search Screen Refactoring

## 📁 Structure

Refactoring ini memisahkan MapSearchScreen menjadi komponen-komponen yang lebih kecil dan reusable.

### Directory Structure

```
screens/map/
└── MapSearchScreen.tsx          # Main screen (refactored)

components/map/
├── index.ts                     # Component exports
├── MapMarker.tsx                # Property price markers
├── CenterMarker.tsx             # Location center marker
├── MapSearchHeader.tsx          # Search header with filters
├── MapBottomSheet.tsx           # Property list bottom sheet
└── LocationNotFoundView.tsx     # Error state UI

hooks/
└── useMapSearch.ts              # Map search logic hook
```

## 🎯 Benefits

### 1. **Separation of Concerns**
- UI components separated from business logic
- Each component has a single responsibility
- Easier to test and maintain

### 2. **Reusability**
- Components can be reused in other parts of the app
- MapMarker can be used in different map views
- Filter components already shared with SearchScreen

### 3. **Maintainability**
- Smaller, focused files are easier to understand
- Changes to one component don't affect others
- Clear boundaries between features

### 4. **Performance**
- useCallback hooks prevent unnecessary re-renders
- Memoized components reduce computation
- Efficient marker rendering

## 📦 Components

### MapMarker
Displays property price on map with styling.
```tsx
<MapMarker
  id={property.id}
  coordinate={[lng, lat]}
  price={property.price}
  currencyCode="RM"
  onPress={handlePress}
/>
```

### CenterMarker
Shows the search location center point.
```tsx
<CenterMarker coordinate={[lng, lat]} />
```

### MapSearchHeader
Search bar with back button and filter button.
```tsx
<MapSearchHeader
  searchQuery="Penang"
  hasActiveFilters={true}
  onBackPress={goBack}
  onSearchPress={openSearch}
  onFilterPress={openFilters}
/>
```

### MapBottomSheet
Horizontal scrollable property list at bottom.
```tsx
<MapBottomSheet
  listings={properties}
  isFavorited={isFavorited}
  onPropertyPress={navigate}
  onFavoriteToggle={toggleFav}
/>
```

### LocationNotFoundView
Error state when location cannot be found.
```tsx
<LocationNotFoundView
  searchQuery="Invalid Location"
  onBackPress={goBack}
  onSearchPress={retry}
/>
```

## 🪝 Hooks

### useMapSearch
Encapsulates map search logic:
- Geocoding search queries
- Fetching properties with filters
- Camera positioning and bounds fitting
- Coordinate validation

```tsx
const { geocodeSearchQuery, fetchProperties } = useMapSearch({
  searchQuery,
  searchFilters,
  setMapCenter,
  setLocationNotFound,
  setListings,
  setLoading,
  cameraRef,
});
```

## 🔄 Migration Guide

The refactored code maintains the same functionality as the original. To use:

1. **Imports are updated** - Uses new component structure
2. **Logic is extracted** - Business logic moved to useMapSearch hook
3. **Callbacks optimized** - All handlers use useCallback
4. **Components split** - UI split into smaller, focused components

### Before (607 lines)
```tsx
export const MapSearchScreen = ({ navigation, route }: any) => {
  // 600+ lines of mixed logic and UI
}
```

### After (249 lines + separated components)
```tsx
export const MapSearchScreen = ({ navigation, route }: any) => {
  // Clean, focused main component
  // Logic delegated to hooks
  // UI delegated to components
}
```

## 🧪 Testing

Each component can now be tested independently:

```tsx
// Test MapMarker
it('renders price correctly', () => {
  render(<MapMarker price={100000} currencyCode="RM" />);
  expect(screen.getByText('RM100,000')).toBeInTheDocument();
});

// Test useMapSearch hook
it('validates coordinates', async () => {
  const { result } = renderHook(() => useMapSearch(props));
  // Test geocoding, fetching, etc.
});
```

## 📝 Next Steps

Potential improvements:
1. Add TypeScript interfaces for all props
2. Extract constants to separate file
3. Add error boundaries
4. Implement marker clustering for large datasets
5. Add unit tests for each component
6. Add E2E tests for map interactions

## 🐛 Troubleshooting

If you encounter issues:
1. Check console for coordinate validation warnings
2. Verify MAPTILER_API_KEY is set
3. Ensure properties have valid lat/lng data
4. Check filter state is updating correctly

## 📚 Related Files

- `components/search/` - Shared filter components
- `components/property/PropertyCard.tsx` - Property card component
- `services/propertyService.ts` - API service
- `hooks/useThemeColors.ts` - Theme hook
- `contexts/FavoritesContext.tsx` - Favorites state
