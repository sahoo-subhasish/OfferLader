import { createContext, useContext, useEffect, useState } from "react";
import LoadingScreen from "../components/LoadingScreen";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebase/firebase";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Show the fancy loading screen only on the very first open of the tab,
  // not on every refresh. sessionStorage is cleared when the tab is closed.
  const [showSplash] = useState(() => !sessionStorage.getItem('a2o_loaded'));
  const [isSplashFinished, setIsSplashFinished] = useState(!showSplash);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            // Check if all mandatory fields are filled
            const mandatoryFields = ['fullName', 'university', 'batch', 'branch'];
            const isProfileIncomplete = mandatoryFields.some(field => !data[field] || data[field].toString().trim() === '');
            setUser({ ...currentUser, ...data, isProfileIncomplete });
          } else {
            setUser({ ...currentUser, isNewUser: true });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      // Mark that we've already shown the splash in this tab session
      sessionStorage.setItem('a2o_loaded', '1');
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {!isSplashFinished
        ? <LoadingScreen isLoading={loading} onComplete={() => setIsSplashFinished(true)} />
        : (loading
            ? <div style={{ position: 'fixed', inset: 0, backgroundColor: '#0E0E0E' }} />
            : children)}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);