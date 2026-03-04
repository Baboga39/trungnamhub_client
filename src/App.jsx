import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

import NotFoundPage from "./components/common/not-found";
import { publicRoutes, privateRoutes } from "./routes";
import MainLayout from "./layouts/MainLayout";
import { LoadingProvider } from "./components/context/LoadingContext";
import GlobalLoading from "./components/common/GlobalLoading";

// PrivateRoute component
function PrivateRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <LoadingProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          {publicRoutes.map(({ path, element }, idx) => (
            <Route key={idx} path={path} element={element} />
          ))}

          {/* Private routes */}
          {privateRoutes.map(({ path, element }, idx) => (
            <Route
              key={idx}
              path={path}
              element={
                <PrivateRoute>
                  <MainLayout>{element}</MainLayout>
                </PrivateRoute>
              }
            />
          ))}

          {/* Catch all - Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Toast global */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />

        {/* ✅ Loading Global */}
        <GlobalLoading />
      </Router>
    </LoadingProvider>
  );
}
