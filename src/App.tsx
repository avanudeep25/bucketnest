
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navigation from '@/components/layout/Navigation';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Wishlist from '@/pages/Wishlist';
import Profile from '@/pages/Profile';
import CreateWishlistItem from '@/pages/CreateWishlistItem';
import WishlistDetail from '@/pages/WishlistDetail';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create" element={<CreateWishlistItem />} />
          <Route path="/wishlist/:id" element={<WishlistDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
