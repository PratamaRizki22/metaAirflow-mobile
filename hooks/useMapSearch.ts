import { useCallback } from 'react';
import * as Location from 'expo-location';
import { propertyService } from '../services';

interface UseMapSearchProps {
    searchQuery: string;
    searchFilters: any;
    setMapCenter: (coords: [number, number]) => void;
    setLocationNotFound: (found: boolean) => void;
    setListings: (listings: any[]) => void;
    setLoading: (loading: boolean) => void;
    cameraRef: React.RefObject<any>;
}

export const useMapSearch = ({
    searchQuery,
    searchFilters,
    setMapCenter,
    setLocationNotFound,
    setListings,
    setLoading,
    cameraRef,
}: UseMapSearchProps) => {
    const geocodeSearchQuery = useCallback(async () => {
        if (!searchQuery) return;

        try {
            setLocationNotFound(false);
            console.log('🌍 Geocoding search query:', searchQuery);
            
            const geocoded = await Location.geocodeAsync(searchQuery);
            
            if (geocoded && geocoded.length > 0) {
                const { latitude, longitude } = geocoded[0];
                console.log('✅ Location found:', { latitude, longitude, name: searchQuery });
                
                setMapCenter([longitude, latitude]);

                cameraRef.current?.setCamera({
                    centerCoordinate: [longitude, latitude],
                    zoomLevel: 13,
                    animationDuration: 1000,
                });
            } else {
                console.log('❌ Location not found:', searchQuery);
                setLocationNotFound(true);
            }
        } catch (error) {
            console.log('❌ Geocoding error:', error);
            setLocationNotFound(true);
        }
    }, [searchQuery, setMapCenter, setLocationNotFound, cameraRef]);

    const fetchProperties = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = { ...searchFilters };
            
            if (searchQuery) {
                params.search = searchQuery;
            }

            console.log('Fetching properties with params:', params);

            const response = await propertyService.getMobileProperties(1, 50, params);
            console.log('API Response:', {
                success: response.success,
                propertiesCount: response.data?.properties?.length || 0,
                hasData: !!response.data
            });

            if (response.success && response.data.properties) {
                const validProperties = response.data.properties.filter(
                    (p: any) => {
                        const hasCoords = p.latitude && p.longitude;
                        const lat = parseFloat(p.latitude);
                        const lng = parseFloat(p.longitude);
                        const isValid = !isNaN(lat) && !isNaN(lng);
                        
                        if (!hasCoords || !isValid) {
                            console.warn(`Property ${p.id} has invalid coordinates:`, { 
                                lat: p.latitude, 
                                lng: p.longitude 
                            });
                        }
                        
                        return hasCoords && isValid;
                    }
                );

                console.log(`✅ Loaded ${validProperties.length} properties with valid coordinates`);
                if (validProperties.length > 0) {
                    console.log('Sample properties:', validProperties.slice(0, 3).map(p => ({
                        id: p.id,
                        title: p.title,
                        lat: p.latitude,
                        lng: p.longitude,
                        price: p.price
                    })));
                }
                
                setListings(validProperties);

                if (validProperties.length > 0) {
                    const coordinates = validProperties.map(p => [
                        parseFloat(String(p.longitude)), 
                        parseFloat(String(p.latitude))
                    ]);
                    
                    const lngs = coordinates.map(c => c[0]);
                    const lats = coordinates.map(c => c[1]);
                    const minLng = Math.min(...lngs);
                    const maxLng = Math.max(...lngs);
                    const minLat = Math.min(...lats);
                    const maxLat = Math.max(...lats);

                    cameraRef.current?.fitBounds(
                        [minLng, minLat],
                        [maxLng, maxLat],
                        [50, 50, 50, 200],
                        1000
                    );
                }
            }
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, searchFilters, setListings, setLoading, cameraRef]);

    return {
        geocodeSearchQuery,
        fetchProperties,
    };
};
