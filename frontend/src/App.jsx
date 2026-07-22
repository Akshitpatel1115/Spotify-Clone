import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/layouts/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import ArtistRoute from './routes/ArtistRoute';
import PublicRoute from './routes/PublicRoute';
import Loader from "./components/common/Loader";

// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Albums = lazy(() => import("./pages/Albums"));
const AlbumDetails = lazy(() => import("./pages/AlbumDetails"));
const CreateAlbum = lazy(() => import("./pages/CreateAlbum"));
const CreateMusic = lazy(() => import("./pages/CreateMusic"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-background"><Loader /></div>}>
      <Routes>
        {/* Public Routes (Only accessible when logged out) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<Layout />}>
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/album" element={<Albums />} />
            <Route path="/album/:id" element={<AlbumDetails />} />
          </Route>

          {/* Artist Routes */}
          <Route element={<ArtistRoute />}>
            <Route path="/create-album" element={<CreateAlbum />} />
            <Route path="/createMusic" element={<CreateMusic />} />
          </Route>
        </Route>

        {/* Catch-all 404 Route (Outside of Layout so no sidebar/navbar) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
