// User types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name: string;
    dateOfBirth: string;
    phone: string;
    role: string;
}

// Registration request
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
}

// Login request
export interface LoginRequest {
    email: string;
    password: string;
}

// Update profile request
export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    phone?: string;
    profilePicture?: string;
}

// Auth response
export interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        token: string;
    };
}

// Generic API response
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

// Error response
export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}
