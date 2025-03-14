import { useState, useEffect } from "react";
import WishlistForm from "@/components/wishlist/WishlistForm";
import { useUserStore } from "@/store/userStore";
import { Loader2, Sparkles, Edit3 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useWishlistStore } from "@/store/wishlistStore";

const CreateWishlistItem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams();
  const currentUser = useUserStore((state) => state.currentUser);
  const wishlistItem = id ? useWishlistStore(state => state.getItem(id)) : undefined;
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-500">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-[10%] w-72 h-72 rounded-full bg-pink-400/20 mix-blend-overlay blur-3xl"></div>
          <div className="absolute bottom-0 right-[10%] w-96 h-96 rounded-full bg-blue-400/20 mix-blend-overlay blur-3xl"></div>
        </div>
        
        <div className="flex justify-center items-center flex-1 relative z-10">
          <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl border border-white/20">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 blur-md opacity-70 animate-pulse"></div>
              <Loader2 className="h-12 w-12 animate-spin text-white relative" />
            </div>
            <p className="text-white text-lg font-medium">Creating Magic...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-500 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-[10%] w-72 h-72 rounded-full bg-pink-400/20 mix-blend-overlay blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 right-[5%] w-96 h-96 rounded-full bg-cyan-400/20 mix-blend-overlay blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-[30%] right-[20%] w-64 h-64 rounded-full bg-yellow-400/10 mix-blend-overlay blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        
        {/* Decorative patterns */}
        <div className="absolute top-20 right-20 w-20 h-20 border-4 border-white/10 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 border-4 border-white/10 rounded-lg transform rotate-12"></div>
        <div className="absolute top-1/3 left-1/4 w-16 h-16 border-4 border-white/10 rounded-lg transform -rotate-12"></div>
      </div>
      
      <div className="container px-4 py-8 md:px-6 max-w-4xl mx-auto relative z-10">
        {currentUser && (
          <div className="mb-8 opacity-0 translate-y-[-20px] animate-fade-in-down">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20">
              <div className="flex items-start md:items-center gap-4 flex-col md:flex-row">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 to-pink-300 text-transparent bg-clip-text">
                    {id ? "Transform Your Dream" : "Imagine Your Next Adventure"}
                  </h1>
                  <p className="text-blue-100 mt-2 text-lg">
                    {id ? (
                      <span className="flex items-center gap-2">
                        <Edit3 className="h-5 w-5 text-pink-300" />
                        Refine your bucket list goal
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-cyan-300" />
                        From dream to reality – add your next bucket list item
                      </span>
                    )}
                  </p>
                </div>
                
                {/* User info circle - optional */}
                {currentUser.photoURL && (
                  <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-cyan-300 shadow-lg shadow-cyan-500/20">
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Form container with glass effect */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 opacity-0 translate-y-[20px] animate-fade-in-up">
          {/* Custom styling will need to be added to the WishlistForm component */}
          <WishlistForm editItem={wishlistItem} />
        </div>
      </div>
    </div>
  );
};

// Add CSS animations directly in the component
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
  
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-down {
    animation: fadeInDown 0.5s ease-out forwards;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out 0.1s forwards;
  }
`;
document.head.appendChild(styleTag);

export default CreateWishlistItem;
