# API Integration Guide

## Setup

### 1. Install Dependencies
```bash
npm install axios @react-native-async-storage/async-storage
```

### 2. Configure Base URL
Edit `services/api.ts` and update the BASE_URL:
```typescript
const BASE_URL = __DEV__ 
  ? 'http://YOUR_LOCAL_IP:3000/api' // For development (use your machine's IP, not localhost)
  : 'https://your-production-domain.com/api'; // For production
```

## Usage Examples

### Authentication

#### Register New User
```typescript
import authService from './services/authService';

const handleRegister = async () => {
  try {
    const response = await authService.register({
      email: 'user@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '1990-01-01',
      phone: '+1234567890',
    });

    console.log('User registered:', response.data.user);
    console.log('Token:', response.data.token);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};
```

#### Login
```typescript
const handleLogin = async () => {
  try {
    const response = await authService.login({
      email: 'user@example.com',
      password: 'password123',
    });

    console.log('User logged in:', response.data.user);
    console.log('Token:', response.data.token);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
};
```

#### Login with Google
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from './contexts/AuthContext';

const GoogleSignInButton = () => {
  const { loginWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      // Configure Google Sign-In
      await GoogleSignin.configure({
        webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
        offlineAccess: true,
      });

      // Check Play Services
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const response = await GoogleSignin.signIn();

      if (response.type === 'success') {
        // Get ID token
        const idToken = response.data.idToken;

        // Authenticate with backend
        await loginWithGoogle(idToken);
        console.log('Google Sign-In successful');
      }
    } catch (error) {
      console.error('Google Sign-In failed:', error);
    }
  };

  return (
    <TouchableOpacity onPress={handleGoogleSignIn}>
      <Text>Sign in with Google</Text>
    </TouchableOpacity>
  );
};
```

**Note:** Backend currently requires `google-auth-library` module to be installed. This will be fixed in the next backend update.

#### Logout
```typescript
const handleLogout = async () => {
  try {
    await authService.logout();
    console.log('User logged out');
  } catch (error) {
    console.error('Logout failed:', error.message);
  }
};
```

#### Check Authentication Status
```typescript
const checkAuth = async () => {
  const isAuth = await authService.isAuthenticated();
  console.log('Is authenticated:', isAuth);

  const user = await authService.getCurrentUser();
  console.log('Current user:', user);
};
```

#### Refresh User Profile
```typescript
import { useAuth } from './contexts/AuthContext';

const ProfileScreen = () => {
  const { refreshProfile } = useAuth();

  const handleRefresh = async () => {
    try {
      await refreshProfile();
      console.log('Profile refreshed');
    } catch (error) {
      console.error('Failed to refresh profile:', error.message);
    }
  };

  return (
    <TouchableOpacity onPress={handleRefresh}>
      <Text>Refresh Profile</Text>
    </TouchableOpacity>
  );
};
```

#### Refresh Token (Manual)
```typescript
import authService from './services/authService';

const handleRefreshToken = async () => {
  try {
    const newToken = await authService.refreshToken();
    console.log('Token refreshed:', newToken);
  } catch (error) {
    console.error('Failed to refresh token:', error.message);
    // Token refresh failed, user needs to login again
  }
};
```

**Note:** Token refresh happens automatically when you get a 401 error. You rarely need to call this manually.

### Making Custom API Calls

#### GET Request
```typescript
import api from './services/api';

const fetchProperties = async () => {
  try {
    const response = await api.get('/properties');
    console.log('Properties:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};
```

#### POST Request
```typescript
const createProperty = async (propertyData) => {
  try {
    const response = await api.post('/properties', propertyData);
    console.log('Property created:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};
```

#### PUT Request
```typescript
const updateProperty = async (id, propertyData) => {
  try {
    const response = await api.put(`/properties/${id}`, propertyData);
    console.log('Property updated:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};
```

#### DELETE Request
```typescript
const deleteProperty = async (id) => {
  try {
    const response = await api.delete(`/properties/${id}`);
    console.log('Property deleted:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};
```

## API Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Error detail"]
  }
}
```

## Authentication Flow

1. **Register/Login**: User credentials are sent to the backend
2. **Token Storage**: JWT token is automatically saved to AsyncStorage
3. **Auto-Injection**: Token is automatically added to all subsequent requests via interceptor
4. **Token Expiry Handling**: 
   - When a request returns 401 (token expired)
   - Automatically calls `/v1/m/auth/refresh-token` to get a new token
   - Retries the failed request with the new token
   - If refresh fails, user is logged out
5. **Seamless Experience**: User never notices token refresh happening in the background

## Error Handling

The API service includes automatic error handling:

- **Network Errors**: Caught and displayed as "Network error. Please check your connection."
- **401 Unauthorized**: 
  - Automatically attempts to refresh token
  - If refresh succeeds, retries the original request
  - If refresh fails, clears auth data (user needs to login again)
- **Other Errors**: Server error messages are passed through to the UI

## TypeScript Types

All API types are defined in `types/api.ts`:

- `User`: User object structure
- `RegisterRequest`: Registration payload
- `LoginRequest`: Login payload
- `AuthResponse`: Authentication response
- `ApiResponse<T>`: Generic API response
- `ApiError`: Error response

## Testing

### Test Registration Endpoint
```bash
curl -X POST http://localhost:3000/api/v1/m/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "dateOfBirth": "1990-01-01",
    "phone": "+1234567890"
  }'
```

### Test Login Endpoint
```bash
curl -X POST http://localhost:3000/api/v1/m/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## API Endpoints

### Mobile Authentication Endpoints
- **Register**: `POST /api/v1/m/auth/register`
- **Login**: `POST /api/v1/m/auth/login`
- **Google Sign-In**: `POST /api/v1/m/auth/google` (requires Google ID token)
- **Get Profile**: `GET /api/v1/m/auth/me` (requires authentication)
- **Refresh Token**: `POST /api/v1/m/auth/refresh-token` (requires authentication)
- **Logout**: `POST /api/v1/m/auth/logout` (if available)

### Test Get Profile Endpoint
```bash
# First login to get token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/m/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Then get profile
curl -X GET http://localhost:3000/api/v1/m/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test Refresh Token Endpoint
```bash
# Login and refresh token in one command
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/m/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# Refresh the token
curl -X POST http://localhost:3000/api/v1/m/auth/refresh-token \
  -H "Authorization: Bearer $TOKEN"
```

## Notes

- Always use your machine's IP address (not localhost) when testing on physical devices or emulators
- Tokens are stored securely in AsyncStorage
- All requests automatically include the auth token if available
- The API service handles token refresh and logout automatically
