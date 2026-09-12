import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, Suspense } from "react";

import NotFoundPage from "./components/common/not-found";
import { publicRoutes, privateRoutes } from "./routes";
import MainLayout from "./layouts/MainLayout";
import { LoadingProvider } from "./components/context/LoadingContext";
import GlobalLoading from "./components/common/GlobalLoading";
import PageLoadingFallback from "./components/common/PageLoadingFallback";
import ErrorBoundary from "./components/common/ErrorBoundary";
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
  const members = useSelector((state) => state.members.members);

  useEffect(() => {
    if (isAuthenticated && members.length === 0) {
      dispatch(fetchMembersThunk());
    }
  }, [isAuthenticated, members.length, dispatch]);

  return (
    <ErrorBoundary>
      <LoadingProvider>
        <Router>
          <Suspense fallback={<PageLoadingFallback />}>
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
          </Suspense>

          <ToastContainer position="top-right" autoClose={3000} theme="light" />
          <GlobalLoading />
        </Router>
      </LoadingProvider>
    </ErrorBoundary>
  );
}