
import { Routes, Route } from 'react-router-dom';
import Navigation from '@/components/layout/Navigation';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Wishlist from '@/pages/Wishlist';
import Profile from '@/pages/Profile';
import CreateWishlistItem from '@/pages/CreateWishlistItem';
import WishlistDetail from '@/pages/WishlistDetail';
import NotFound from '@/pages/NotFound';
import Collections from '@/pages/Collections';
import CollectionEditor from '@/components/sharing/CollectionEditor';
import SharedCollection from '@/pages/SharedCollection';
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            <>
              <Navigation />
              <Index />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/wishlist" element={
            <>
              <Navigation />
              <Wishlist />
            </>
          } />
          <Route path="/profile" element={
            <>
              <Navigation />
              <Profile />
            </>
          } />
          <Route path="/create" element={
            <>
              <Navigation />
              <CreateWishlistItem />
            </>
          } />
          <Route path="/wishlist/:id" element={
            <>
              <Navigation />
              <WishlistDetail />
            </>
          } />
          <Route path="/wishlist/edit/:id" element={
            <>
              <Navigation />
              <CreateWishlistItem />
            </>
          } />
          <Route path="/collections" element={
            <>
              <Navigation />
              <Collections />
            </>
          } />
          <Route path="/collections/:id" element={
            <>
              <Navigation />
              <CollectionEditor />
            </>
          } />
          <Route path="/share/:slug" element={<SharedCollection />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster />
    </div>
  );
}

export default App;
