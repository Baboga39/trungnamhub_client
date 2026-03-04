import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";

import NotFoundPage from "./components/common/not-found";
import { publicRoutes, privateRoutes } from "./routes";
import MainLayout from "./layouts/MainLayout";
import { LoadingProvider } from "./components/context/LoadingContext";
import GlobalLoading from "./components/common/GlobalLoading";
import { fetchMembersThunk } from "./features/members/memberThunks";

// PrivateRoute
function PrivateRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMembersThunk());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <LoadingProvider>
      <Router>
        <Routes>
          {publicRoutes.map(({ path, element }, idx) => (
            <Route key={idx} path={path} element={element} />
          ))}

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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        <GlobalLoading />
      </Router>
    </LoadingProvider>
  );
}