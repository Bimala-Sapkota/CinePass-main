import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useTheme } from "../context/ThemeContext";
import { Outlet, useLocation, useNavigation } from "react-router";
import SignIn from "../components/Auth/SignIn";
import Register from "../components/Auth/Register";
import AppLoader from "../components/common/AppLoader";

function AppLayout() {
  const { darkMode } = useTheme();
  const location = useLocation();
  const navigation = useNavigation();
  const isLoadingPage = navigation.state === "loading";

  // loading state
  const [isAppLoading, setIsAppLoading] = useState(true);

  //determine which model is open: "register", "signin" or null(for closed)
  const [activeModal, setActiveModal] = useState(null);
  const [redirectPath, setRedirectPath] = useState("/");

  const handleLoadingComplete = () => {
    setIsAppLoading(false);
  };

  const openRegisterModal = () => {
    setRedirectPath(location.pathname);
    setActiveModal("register");
  };

  const openSignInModal = () => {
    setRedirectPath(location.pathname);
    setActiveModal("signin");
  };
  const closeModal = () => setActiveModal(null);
  const switchToSignIn = () => {
    setActiveModal("signin");
  };
  const switchToRegister = () => {
    setActiveModal("register");
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      openSignInModal();
    };

    window.addEventListener("unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, []);

  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [activeModal]);

  if (isAppLoading) {
    return <AppLoader onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 animate-fade-in ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {isLoadingPage && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-purple-500 z-[100] animate-pulse"></div>
      )}
      <Header
        openRegisterModal={openRegisterModal}
        openSignInModal={openSignInModal}
      />
      <main className="max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Footer />
      {activeModal === "register" && (
        <Register onClose={closeModal} onSwitchToSignIn={switchToSignIn} />
      )}
      {activeModal === "signin" && (
        <SignIn
          onClose={closeModal}
          onSwitchToRegister={switchToRegister}
          redirectPath={redirectPath}
        />
      )}
    </div>
  );
}

export default AppLayout;
