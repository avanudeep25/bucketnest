
import WishlistForm from "@/components/wishlist/WishlistForm";
import Navigation from "@/components/layout/Navigation";

const CreateWishlistItem = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container px-4 py-8 md:px-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Add a New Upcoming Experience</h1>
        <WishlistForm />
      </div>
    </div>
  );
};

export default CreateWishlistItem;
