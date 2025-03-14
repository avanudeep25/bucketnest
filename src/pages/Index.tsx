import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Share2, FolderHeart, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";

const Index = () => {
  const { currentUser } = useUserStore();
  const [userName, setUserName] = useState("");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Mark auth as ready once we've checked for currentUser
    setIsAuthReady(true);
    
    if (currentUser?.name) {
      setUserName(currentUser.name);
    } else {
      setUserName("");
    }
  }, [currentUser]);

  // Memory carousel images
  const memories = [
    {
      src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      alt: "Mountain landscape at sunset",
      caption: "Mountain Sunset Adventure"
    },
    {
      src: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3",
      alt: "Camping under starry night sky",
      caption: "Stargazing Camp Night"
    },
    {
      src: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b",
      alt: "Hiking through misty forest",
      caption: "Misty Forest Exploration"
    },
    {
      src: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4",
      alt: "Person kayaking in crystal clear water",
      caption: "Kayaking in Crystal Waters"
    },
    {
      src: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6",
      alt: "Hiking on mountain trail",
      caption: "Mountain Trail Hike"
    }
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);
  
  const nextSlide = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === memories.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevSlide = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? memories.length - 1 : prevIndex - 1
    );
  };
  
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  
  const handleStartJourney = () => {
    // Only proceed if auth state is determined
    if (!isAuthReady) {
      toast.info("Checking authentication status...");
      return;
    }
    
    if (currentUser) {
      navigate("/create");
    } else {
      toast.info("Please log in to start your journey");
      // Use replace: true to avoid the intermediate step in history
      navigate("/login", { replace: true });
    }
  };

  useEffect(() => {
    autoPlayRef.current = nextSlide;
  });
  
  useEffect(() => {
    const play = () => {
      autoPlayRef.current();
    };
    
    const interval = setInterval(play, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero section - Center aligned with conditional spacing */}
      <section className={`relative ${userName ? "py-16 md:py-24" : "py-24 md:py-32"} bg-gradient-to-b from-blue-50 to-purple-100 overflow-hidden`}>
        {/* Subtle animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-yellow-300/10 mix-blend-multiply blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-pink-400/10 mix-blend-multiply blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        </div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-block rounded-full bg-blue-100 px-4 py-1.5 text-sm text-blue-800 mb-4">
              Your Personal Bucket List Planner
            </div>
            
            {userName ? (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-3">
                <span>Hello <span className="text-blue-600">{userName}</span>,</span>
              </h1>
            ) : (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                <span>Discover, Plan, and Share<br />Your Life Adventures</span>
              </h1>
            )}
            
            {userName && (
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                Your Next Adventure Awaits
              </h2>
            )}
            
            <p className={`text-xl text-gray-700 ${userName ? "mb-4" : "mb-8"} max-w-2xl`}>
              From dream vacations to weekend getaways, from culinary explorations to life goals — BucketNest keeps all your bucket-list items organized in one beautiful place.
            </p>
            
            <div className={userName ? "mb-6" : "mt-2"}>
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                onClick={handleStartJourney}
              >
                <Plus className="mr-2 h-5 w-5" />
                Start Your Journey
              </Button>
            </div>
          </div>
          
          <div className={`${userName ? "mt-8" : "mt-16"} max-w-4xl mx-auto`}>
            <div className="relative">
              <div className="relative h-[450px] w-full max-w-3xl mx-auto overflow-hidden" ref={carouselRef}>
                <div className="absolute top-0 left-0 w-full h-full bg-gray-100/50 backdrop-blur-sm rounded-lg z-0"></div>
                
                <div className="carousel-wrapper relative h-full w-full flex items-center justify-center py-8 px-4">
                  {currentIndex > 0 && (
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 -rotate-6 w-48 h-64 z-10 opacity-60 transition-all duration-300">
                      <div className="w-full h-full p-2 bg-white shadow-md rounded">
                        <img 
                          src={memories[(currentIndex - 1) % memories.length].src} 
                          alt="Previous memory"
                          className="w-full h-48 object-cover rounded"
                        />
                        <div className="p-2 text-center">
                          {/* Empty div for spacing */}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="memory-card relative z-20 transform transition-all duration-500 rotate-2">
                    <div className="w-64 h-80 p-3 bg-white shadow-lg rounded">
                      <img 
                        src={memories[currentIndex].src} 
                        alt={memories[currentIndex].alt}
                        className="w-full h-56 object-cover rounded"
                      />
                      <div className="p-2 text-center">
                        <p className="font-medium text-sm">{memories[currentIndex].caption}</p>
                        <p className="text-xs text-gray-500 mt-1">Add this to your Bucket List</p>
                      </div>
                      
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full"></div>
                      <div className="absolute top-[30%] left-0 transform -translate-x-1/2 w-6 h-2 bg-yellow-300 rounded"></div>
                    </div>
                  </div>
                  
                  {currentIndex < memories.length - 1 && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-6 w-48 h-64 z-10 opacity-60 transition-all duration-300">
                      <div className="w-full h-full p-2 bg-white shadow-md rounded">
                        <img 
                          src={memories[(currentIndex + 1) % memories.length].src} 
                          alt="Next memory"
                          className="w-full h-48 object-cover rounded"
                        />
                        <div className="p-2 text-center">
                          {/* Empty div for spacing */}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-4 right-4 w-32 h-40 bg-white rounded shadow-sm transform rotate-12 z-0"></div>
                <div className="absolute bottom-6 right-8 w-32 h-40 bg-white rounded shadow-sm transform -rotate-6 z-0"></div>
                
                <button 
                  onClick={prevSlide}
                  className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-3 shadow-lg transition-all duration-200 z-30"
                  aria-label="Previous memory"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-3 shadow-lg transition-all duration-200 z-30"
                  aria-label="Next memory"
                >
                  <ChevronRight className="h-6 w-6 text-gray-700" />
                </button>
              </div>
              
              <div className="flex justify-center mt-6">
                {memories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 mx-1 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? "bg-blue-600 w-6" 
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              
              <div className="absolute -top-3 left-1/4 w-16 h-6 bg-yellow-300/60 rounded-sm transform rotate-6"></div>
              <div className="absolute -top-2 right-1/3 w-12 h-4 bg-blue-300/60 rounded-sm transform -rotate-3"></div>
            </div>
          </div>
        </div>
      </section>

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
      
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white relative">
        <div className="container px-4 md:px-6 mx-auto text-center">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            onClick={handleStartJourney}
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Your Bucket List
          </Button>
          
          <p className="mt-8 text-xl font-medium italic text-blue-600">
            BucketNest — Dream. Plan. Share.
          </p>
        </div>
      </section>
    </div>
  );
};

// Add CSS for the float animation
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
    100% { transform: translateY(0px); }
  }
  
  .animate-float {
    animation: float 15s ease-in-out infinite;
  }
`;
document.head.appendChild(styleTag);

export default Index;
