import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Share2, FolderHeart, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useUserStore } from "@/store/userStore";

const Index = () => {
  const { currentUser } = useUserStore();
  const [userName, setUserName] = useState("");
  
  useEffect(() => {
    if (currentUser?.name) {
      setUserName(currentUser.name);
    } else {
      setUserName("");
    }
  }, [currentUser]);

  // Adventure image gallery
  const adventureImages = [
    {
      src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      alt: "Mountain landscape at sunset",
      location: "Mountain Range"
    },
    {
      src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3",
      alt: "Camping under starry night sky",
      location: "Night Camp"
    },
    {
      src: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b",
      alt: "Hiking through misty forest",
      location: "Wilderness Trail"
    },
    {
      src: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
      alt: "Person kayaking in crystal clear water",
      location: "Clear Lake"
    }
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === adventureImages.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? adventureImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section - Center aligned */}
      <section className="relative py-24 md:py-32 bg-gradient-to-b from-blue-50 to-purple-100 overflow-hidden">
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-yellow-300/10 mix-blend-multiply blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-pink-400/10 mix-blend-multiply blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm text-blue-800 mb-6">
              Your Personal Bucket List Planner
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
              {userName ? (
                <span>Hello <span className="text-blue-600">{userName}</span>,<br />Your Next Adventure Awaits</span>
              ) : (
                <span>Discover, Plan, and Share<br />Your Life Adventures</span>
              )}
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 max-w-2xl">
              From dream vacations to weekend getaways, from culinary explorations to life goals — BucketNest keeps all your bucket-list items organized in one beautiful place.
            </p>
            
            <div className="mt-2">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                <Link to="/create">
                  <Plus className="mr-2 h-5 w-5" />
                  Start Your Journey
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Adventure image showcase */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-blue-300 rounded-full blur-xl opacity-20"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-pink-300 rounded-full blur-xl opacity-20"></div>
              
              {/* Main featured image */}
              <div className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl">
                <div className="aspect-[16/9] rounded-xl overflow-hidden relative">
                  <img
                    src={adventureImages[currentImageIndex].src}
                    alt={adventureImages[currentImageIndex].alt}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                  />
                  <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg">
                    <div className="flex items-center text-sm font-medium text-gray-800">
                      <MapPin className="h-4 w-4 text-blue-600 mr-1" />
                      {adventureImages[currentImageIndex].location}
                    </div>
                  </div>
                  
                  {/* Navigation arrows */}
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow-lg transition-all duration-200"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow-lg transition-all duration-200"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-700" />
                  </button>
                </div>
                
                {/* Thumbnail navigation */}
                <div className="flex justify-center mt-4 gap-2">
                  {adventureImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? "border-blue-500 scale-110" 
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img 
                        src={image.src} 
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Additional adventure images */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/90 p-2 rounded-xl shadow-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1533240332313-0db49b459ad6" 
                  alt="Hiking on mountain trail"
                  className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                />
                <p className="text-xs text-center mt-1 font-medium">Mountain Trails</p>
              </div>
              <div className="bg-white/90 p-2 rounded-xl shadow-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1516939884455-1445c8652f83" 
                  alt="Beach sunset adventure"
                  className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                />
                <p className="text-xs text-center mt-1 font-medium">Ocean Getaways</p>
              </div>
              <div className="bg-white/90 p-2 rounded-xl shadow-lg overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1517411032315-54ef2cb783bb" 
                  alt="Campsite by the lake"
                  className="w-full h-32 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                />
                <p className="text-xs text-center mt-1 font-medium">Wilderness Camping</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section - center aligned with three columns */}
      <section className="py-20 md:py-28 bg-white relative">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Plan, Organize, and Share Your Dreams</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              BucketNest helps you organize, track, and share all your life's adventures — big and small.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-8 bg-blue-50 rounded-2xl text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                <FolderHeart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Organize Collections</h3>
              <p className="text-gray-600">
                Group your experiences by theme, location, or timeline. Create custom collections like "Summer 2024" or "Dream Destinations."
              </p>
            </div>
            
            <div className="p-8 bg-purple-50 rounded-2xl text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 text-purple-600 mb-6">
                <Share2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Share Adventures</h3>
              <p className="text-gray-600">
                Create shareable links to showcase your bucket list collections with friends and family. Your memories deserve to be shared.
              </p>
            </div>
            
            <div className="p-8 bg-green-50 rounded-2xl text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-6">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Track Achievements</h3>
              <p className="text-gray-600">
                Check off completed experiences and build a visual timeline of your life's best moments. Never lose track of your memories.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Final CTA section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white relative">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
            <Link to="/create">
              <Plus className="mr-2 h-5 w-5" />
              Create Your Bucket List
            </Link>
          </Button>
          
          <p className="mt-8 text-xl font-medium italic text-blue-600">
            BucketNest — Dream. Plan. Share.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
