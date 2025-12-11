import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_BASE_URL = "http://localhost:3000";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAuth, setUserAuth] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = () => {
    try {
      const savedUserAuth = localStorage.getItem("userAuth");
      const savedAdminAuth = localStorage.getItem("adminAuth");
      const savedToken = localStorage.getItem("authToken");

      console.log("Auth check - Token:", savedToken ? savedToken.substring(0, 20) + "..." : "No token");
      console.log("Auth check - User auth:", savedUserAuth);
      console.log("Auth check - Admin auth:", savedAdminAuth);

      // Validate token format before using it
      if (savedToken && isValidToken(savedToken)) {
        if (savedUserAuth) {
          try {
            const auth = JSON.parse(savedUserAuth);
            setUserAuth(auth);
            setIsAuthenticated(true);
            console.log("User auth restored");
          } catch (e) {
            console.error("Failed to parse user auth:", e);
            clearAuthData();
          }
        }

        if (savedAdminAuth) {
          try {
            const admin = JSON.parse(savedAdminAuth);
            setAdminUser(admin);
            console.log("Admin auth restored");
          } catch (e) {
            console.error("Failed to parse admin auth:", e);
            localStorage.removeItem("adminAuth");
          }
        }
      } else {
        // Invalid token, clear everything
        console.log("Invalid token found, clearing auth data");
        clearAuthData();
      }

    } catch (error) {
      console.error("Auth check error:", error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const isValidToken = (token) => {
    // Basic JWT format validation
    if (!token || typeof token !== 'string') return false;
    
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return false;
    
    try {
      // Try to parse the payload to check if it's valid JSON
      JSON.parse(atob(tokenParts[1]));
      return true;
    } catch (e) {
      return false;
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userAuth");
    localStorage.removeItem("adminAuth");
    setUserAuth(null);
    setAdminUser(null);
    setIsAuthenticated(false);
  };

  const setUserFromAPI = (apiResponse) => {
    const userData = apiResponse.user || apiResponse;
    const user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      phone: userData.phone,
      address: userData.address || null,
      profileImage: userData.profileImage || null,
    };
  
    // Validate token before storing
    if (!apiResponse.token || !isValidToken(apiResponse.token)) {
      throw new Error("Invalid token received from server");
    }
  
    localStorage.setItem("authToken", apiResponse.token);
    
    // Check if the user is an admin
    if (["admin", "manager", "receptionist", "housekeeping"].includes(user.role)) {
      localStorage.setItem("adminAuth", JSON.stringify(user)); // Store admin data
      localStorage.setItem("userAuth", JSON.stringify(user)); // Store user data
      setAdminUser(user);  // Set admin data in context
    } else {
      localStorage.setItem("userAuth", JSON.stringify(user)); // Store user data
      setUserAuth(user);  // Set user data in context
    }
  
    setIsAuthenticated(true);  // Mark as authenticated
  
    return user;
  }
  
  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
          role: "user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: error.message };
    }
  };

  const loginUser = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Validate the token from server
      if (!data.token || !isValidToken(data.token)) {
        throw new Error("Invalid token received from server");
      }

      const user = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        address: data.user.address,
        profileImage: data.user.profileImage,
      };

      // Store auth data
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userAuth", JSON.stringify(user));

      setUserAuth(user);
      setIsAuthenticated(true);

      console.log("User login successful, token stored");

      return { success: true, user, token: data.token };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logoutUser = () => {
    console.log("Logging out user");
    clearAuthData();
  };

  const canAccessAdmin = () => {
    if (!userAuth) return false;
    const adminRoles = [
      "admin",
      "manager",
      "receptionist",
      "housekeeping",
      "staff",
    ];
    return adminRoles.includes(userAuth.role);
  };

  const isGuest = () => {
    return userAuth?.role === "guest";
  };

  const loginAdmin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed");
      }

      // Validate token
      if (!data.token || !isValidToken(data.token)) {
        throw new Error("Invalid token received from server");
      }

      const adminRoles = ["admin", "manager", "receptionist", "housekeeping"];
      if (!adminRoles.includes(data.user.role)) {
        throw new Error("User does not have admin access");
      }

      const admin = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      };

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("adminAuth", JSON.stringify(admin));

      setAdminUser(admin);

      return { success: true, admin, token: data.token };
    } catch (error) {
      console.error("Admin login error:", error);
      return { success: false, error: error.message };
    }
  };

  const logoutAdmin = () => {
    console.log("Logging out admin");
    setAdminUser(null);
    localStorage.removeItem("adminAuth");
    // Don't remove user auth if admin is also a user
    if (!userAuth) {
      localStorage.removeItem("authToken");
    }
  };

  const getToken = () => {
    const token = localStorage.getItem("authToken");
    console.log("Getting token:", token ? token.substring(0, 20) + "..." : "No token");
    
    if (token && !isValidToken(token)) {
      console.error("Invalid token found, clearing auth");
      clearAuthData();
      return null;
    }
    
    return token;
  };

  // Remove the auto-login for admin in development
  // This was causing issues with invalid tokens

  return (
    <AuthContext.Provider
      value={{
        // User
        isAuthenticated,
        userAuth,
        setUserFromAPI,
        registerUser,
        loginUser,
        logoutUser,
        canAccessAdmin,
        isGuest,
        // Admin
        adminUser,
        loginAdmin,
        logoutAdmin,
        loading,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};