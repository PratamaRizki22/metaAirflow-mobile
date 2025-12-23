# Guest Mode & Authentication

Aplikasi MetaAirflow menggunakan strategi "Browse First, Login Later" untuk meningkatkan user engagement.

## Flow Aplikasi

```
Splash → Welcome → Preferences → Onboarding → Main App (Guest Mode)
                                                    ↓
                                            Browse Properties
                                                    ↓
                                    Login Required untuk fitur tertentu
```

## Fitur Guest Mode

### Dapat Diakses Tanpa Login
- Browse daftar properti
- Search & filter properti
- Lihat detail properti
- Lihat foto & video
- Lihat lokasi di map
- Share properti

### Memerlukan Login
- Save to favorites
- Contact seller/agent
- Post property
- Make offer/booking
- View saved searches
- Manage listings

## Cara Menggunakan

### 1. Setup di Component

```typescript
import { useAuth } from '../contexts/AuthContext';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { LoginPrompt } from '../components/auth';

function MyComponent() {
  const { isLoggedIn } = useAuth();
  
  const {
    requireAuth,
    showPrompt,
    handleLogin,
    handleRegister,
    handleClose,
  } = useRequireAuth({
    title: 'Save to Favorites',
    message: 'Login to save your favorite properties',
  });

  // Wrap action yang butuh auth
  const handleSaveFavorite = requireAuth(() => {
    // Logic save favorite
    console.log('Saving...');
  });

  return (
    <>
      <TouchableOpacity onPress={handleSaveFavorite}>
        <Text>Save Favorite</Text>
      </TouchableOpacity>

      <LoginPrompt
        visible={showPrompt}
        title="Save to Favorites"
        message="Login to continue"
        onLogin={handleLogin}
        onRegister={handleRegister}
        onClose={handleClose}
      />
    </>
  );
}
```

### 2. Check Auth Status

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Text>Welcome {user.name}</Text>;
  }

  return <Text>Continue as Guest</Text>;
}
```

### 3. Login/Logout

```typescript
import { useAuth } from '../contexts/AuthContext';

function ProfileScreen() {
  const { login, logout, isLoggedIn } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // Success
    } catch (error) {
      // Handle error
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {isLoggedIn ? (
        <Button onPress={handleLogout}>Logout</Button>
      ) : (
        <Button onPress={handleLogin}>Login</Button>
      )}
    </>
  );
}
```

## Migrasi ke API Real

Saat ini menggunakan mock data. Untuk migrasi ke API:

### AuthContext.tsx

```typescript
// Ganti mock login dengan API call
const login = async (email: string, password: string) => {
  const response = await fetch('https://api.metaairflow.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    await AsyncStorage.setItem('token', data.token);
    setUser(data.user);
  } else {
    throw new Error(data.message);
  }
};
```

## File Structure

```
contexts/
  └── AuthContext.tsx       - Auth state management

hooks/
  └── useRequireAuth.ts     - Hook untuk require auth

components/
  └── auth/
      └── LoginPrompt.tsx   - Modal login prompt

screens/
  └── property/
      └── PropertyDetailScreen.tsx  - Contoh implementasi
```

## Best Practices

1. Selalu gunakan `requireAuth()` untuk fitur yang butuh login
2. Berikan pesan yang jelas kenapa user perlu login
3. Jangan paksa user login di awal
4. Simpan pending action setelah login berhasil
5. Gunakan AsyncStorage untuk persist auth state
