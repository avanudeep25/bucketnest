
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Compass, Star, Target, Rocket, MapPin } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useState, useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    setIsLoggedIn(currentUser !== null);
  }, [currentUser]);

  const features = [
    {
      icon: <Compass className="h-8 w-8 text-blue-500" />,
      title: "Plan your Adventures",
      description: "Find and save experiences you want to have in your lifetime."
    },
    {
      icon: <Target className="h-8 w-8 text-green-500" />,
      title: "Track Progress",
      description: "Mark items as complete as you achieve your bucket list goals."
    },
    {
      icon: <Check className="h-8 w-8 text-purple-500" />,
      title: "Remember Forever",
      description: "Keep a record of all your amazing life experiences."
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: "Travel with Friends",
      description: "Add squad members to share your bucket list adventures."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Gradient Background */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-400 to-sky-300">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3OTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cmVjdCBmaWxsPSJub25lIiB3aWR0aD0iMTQ0MCIgaGVpZ2h0PSI3OTAiLz48Y2lyY2xlIGZpbGwtb3BhY2l0eT0iLjA1IiBmaWxsPSIjZmZmIiBjeD0iMzg4IiBjeT0iMjk4IiByPSI4MCIvPjxjaXJjbGUgZmlsbC1vcGFjaXR5PSIuMDUiIGZpbGw9IiNmZmYiIGN4PSIxMDgxIiBjeT0iMzM0IiByPSI4MCIvPjxjaXJjbGUgZmlsbC1vcGFjaXR5PSIuMDUiIGZpbGw9IiNmZmYiIGN4PSI3OTEiIGN5PSI1OTAiIHI9IjgwIi8+PGNpcmNsZSBmaWxsLW9wYWNpdHk9Ii4wNSIgZmlsbD0iI2ZmZiIgY3g9IjY4NiIgY3k9IjE0OCIgcj0iNDAiLz48Y2lyY2xlIGZpbGwtb3BhY2l0eT0iLjA1IiBmaWxsPSIjZmZmIiBjeD0iMjIxIiBjeT0iNDMxIiByPSI0MCIvPjxjaXJjbGUgZmlsbC1vcGFjaXR5PSIuMDUiIGZpbGw9IiNmZmYiIGN4PSIyODYiIGN5PSI2ODUiIHI9IjQwIi8+PGNpcmNsZSBmaWxsLW9wYWNpdHk9Ii4wNSIgZmlsbD0iI2ZmZiIgY3g9IjYwNiIgY3k9IjQzMyIgcj0iNDAiLz48Y2lyY2xlIGZpbGwtb3BhY2l0eT0iLjA1IiBmaWxsPSIjZmZmIiBjeD0iOTc5IiBjeT0iMjI4IiByPSI0MCIvPjxjaXJjbGUgZmlsbC1vcGFjaXR5PSIuMDUiIGZpbGw9IiNmZmYiIGN4PSIxMTE4IiBjeT0iNTQxIiByPSI0MCIvPjxjaXJjbGUgZmlsbC1vcGFjaXR5PSIuMDUiIGZpbGw9IiNmZmYiIGN4PSI0NzciIGN5PSI1MzAiIHI9IjQwIi8+PGNpcmNsZSBmaWxsLW9wYWNpdHk9Ii4wNSIgZmlsbD0iI2ZmZiIgY3g9Ijc5OSIgY3k9IjMyNyIgcj0iMjAiLz48Y2lyY2xlIGZpbGwtb3BhY2l0eT0iLjA1IiBmaWxsPSIjZmZmIiBjeD0iMTIwOCIgY3k9IjE5OSIgcj0iMjAiLz48Y2lyY2xlIGZpbGwtb3BhY2l0eT0iLjA1IiBmaWxsPSIjZmZmIiBjeD0iMjE4IiBjeT0iMTkwIiByPSIyMCIvPjxjaXJjbGUgZmlsbC1vcGFjaXR5PSIuMDUiIGZpbGw9IiNmZmYiIGN4PSI0MTIiIGN5PSI2ODkiIHI9IjIwIi8+PGNpcmNsZSBmaWxsLW9wYWNpdHk9Ii4wNSIgZmlsbD0iI2ZmZiIgY3g9IjczMCIgY3k9IjQ3MyIgcj0iMjAiLz48Y2lyY2xlIGZpbGwtb3BhY2l0eT0iLjA1IiBmaWxsPSIjZmZmIiBjeD0iMTEzNCIgY3k9IjQxNSIgcj0iMjAiLz48Y2lyY2xlIGZpbGwtb3BhY2l0eT0iLjA1IiBmaWxsPSIjZmZmIiBjeD0iOTMzIiBjeT0iNjUwIiByPSIyMCIvPjwvZz48L3N2Zz4=')] opacity-40 mix-blend-overlay"></div>
        <div className="container mx-auto px-6 py-16 md:py-28 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-md">
            Your Life's Adventures
            <br /> 
            <span className="text-white/90">All in One Place</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto drop-shadow">
            Create your bucket list, track your experiences, and share adventures with friends.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="bg-white hover:bg-white/90 text-blue-600 text-lg px-8 py-6 shadow-lg"
              onClick={() => navigate(isLoggedIn ? '/create' : '/login')}
            >
              Start Your Journey
              <MapPin className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              className="bg-blue-600/20 hover:bg-blue-600/30 text-white border border-white/30 backdrop-blur-sm text-lg px-8 py-6"
              onClick={() => navigate(isLoggedIn ? '/wishlist' : '/login')}
            >
              {isLoggedIn ? 'View My Bucket List' : 'Get Started'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            {!isLoggedIn && (
              <Button 
                variant="outline" 
                className="text-lg px-8 py-6 text-white border-white/40 hover:bg-white/10 backdrop-blur-sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,128L48,149.3C96,171,192,213,288,224C384,235,480,213,576,181.3C672,149,768,107,864,96C960,85,1056,107,1152,122.7C1248,139,1344,149,1392,154.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How Bucket <span className="text-blue-600">Nest</span> Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <Rocket className="h-12 w-12 text-white/90 animate-float" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Begin tracking your bucket list today and turn your dreams into memories.
          </p>
          <Button 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 shadow-lg"
            onClick={() => navigate(isLoggedIn ? '/create' : '/login')}
          >
            {isLoggedIn ? 'Add New Experience' : 'Create Your Bucket List'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-600">© 2025 Bucket Nest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
