
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/layout/Navigation";
import { MapPin, BookmarkPlus, Compass, List } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1">
        {/* Hero section */}
        <section className="relative pt-16 pb-24 md:py-24 lg:py-32 bg-gradient-to-b from-wishwise-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 md:grid-cols-2 md:gap-16 items-center">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="inline-block rounded-lg bg-wishwise-100 px-3 py-1 text-sm text-wishwise-800 mb-4">
                    Your Personal Wishlist Hub
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Organize Your Dream <span className="text-wishwise-600">Destinations</span> & <span className="text-wishwise-600">Activities</span>
                  </h1>
                  <p className="mt-4 text-gray-500 md:text-xl">
                    WishWise Hub helps you keep track of all the places you want to visit, 
                    activities you want to experience, and dreams you want to fulfill.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="bg-wishwise-500 hover:bg-wishwise-600">
                    <Link to="/create">
                      <BookmarkPlus className="mr-2 h-5 w-5" />
                      Create Your First Wish
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/wishlist">
                      <List className="mr-2 h-5 w-5" />
                      View Wishlist
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-wishwise-100 rounded-full blur-xl opacity-80"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-wishwise-100 rounded-full blur-xl opacity-80"></div>
                <div className="relative space-y-4">
                  <div className="p-3 md:p-6 bg-white rounded-xl shadow-lg animate-float">
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="h-5 w-5 text-wishwise-500" />
                      <h3 className="font-medium">Northern Lights in Norway</h3>
                    </div>
                    <div className="aspect-video rounded-lg bg-gray-100 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                        alt="Northern Lights"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="p-3 md:p-6 bg-white rounded-xl shadow-lg ml-auto animate-float" style={{ animationDelay: "0.8s" }}>
                    <div className="flex items-center gap-3 mb-2">
                      <MapPin className="h-5 w-5 text-wishwise-500" />
                      <h3 className="font-medium">Scuba Diving in the Maldives</h3>
                    </div>
                    <div className="aspect-video rounded-lg bg-gray-100 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                        alt="Scuba Diving"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
              <p className="mt-4 text-gray-500 md:text-xl max-w-2xl mx-auto">
                WishWise Hub offers everything you need to organize and track your travel and activity wishlist.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-3 bg-wishwise-100 rounded-full mb-4">
                  <BookmarkPlus className="h-6 w-6 text-wishwise-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Create Structured Wishlists</h3>
                <p className="text-gray-500">
                  Add detailed information about places you want to visit and activities you want to experience.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-3 bg-wishwise-100 rounded-full mb-4">
                  <Compass className="h-6 w-6 text-wishwise-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Track Your Dreams</h3>
                <p className="text-gray-500">
                  Keep all your aspirations in one place with custom categories, tags, and target dates.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="p-3 bg-wishwise-100 rounded-full mb-4">
                  <List className="h-6 w-6 text-wishwise-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Organize Everything</h3>
                <p className="text-gray-500">
                  Add notes, budget information, images, and links to keep everything organized.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 md:py-24 bg-wishwise-50">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl max-w-xl mx-auto">
              Start Building Your Dream Wishlist Today
            </h2>
            <p className="mt-4 text-gray-500 md:text-xl max-w-2xl mx-auto mb-8">
              It's free, simple to use, and will help you keep track of all your wishlist items in one place.
            </p>
            <Button asChild size="lg" className="bg-wishwise-500 hover:bg-wishwise-600">
              <Link to="/create">
                <BookmarkPlus className="mr-2 h-5 w-5" />
                Add Your First Wish
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
