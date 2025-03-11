
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Compass, Star, Target, Rocket } from "lucide-react";
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
      title: "Discover & Plan",
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-6 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Your Life's Adventures
            <br /> 
            <span className="text-blue-600">All in One Place</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create your bucket list, track your experiences, and share adventures with friends.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
              onClick={() => navigate(isLoggedIn ? '/wishlist' : '/login')}
            >
              {isLoggedIn ? 'View My Bucket List' : 'Get Started'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {!isLoggedIn && (
              <Button 
                variant="outline" 
                className="text-lg px-8 py-6"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
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
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <Rocket className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Begin tracking your bucket list today and turn your dreams into memories.
          </p>
          <Button 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6"
            onClick={() => navigate(isLoggedIn ? '/wishlist' : '/login')}
          >
            {isLoggedIn ? 'View My Bucket List' : 'Create Your Bucket List'}
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
