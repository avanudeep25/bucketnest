import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/layout/Navigation";
import { Plus, MapPin, Users, ListChecks, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-1">
        {/* Hero section */}
        <section className="relative pt-16 pb-24 md:py-24 lg:py-32 bg-gradient-to-br from-blue-400/10 to-purple-500/20 overflow-hidden">
          {/* Animated background shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-[10%] w-64 h-64 rounded-full bg-yellow-300/20 mix-blend-multiply blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-[10%] w-96 h-96 rounded-full bg-pink-400/20 mix-blend-multiply blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
            <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-blue-400/20 mix-blend-multiply blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-green-300/10 mix-blend-multiply blur-3xl animate-float" style={{ animationDelay: "1.5s" }}></div>
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 md:grid-cols-2 md:gap-16 items-center">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800 mb-4">
                    Your Personal Bucket List Planner
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
                    <span className="font-normal italic">Your Next Adventure Awaits!</span>
                  </h1>
                  <p className="mt-4 text-gray-700 md:text-xl">
                    From your next vacation to your next friends' outing, from tasting a new whisky to fixing a place to meet your girlfriend—BucketNest keeps all your bucket-list items small to big all in one place.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600">
                    <Link to="/create">
                      <Plus className="mr-2 h-5 w-5" />
                      Start Your Journey
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-300 rounded-full blur-xl opacity-30"></div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-300 rounded-full blur-xl opacity-30"></div>
                <div className="relative">
                  <div className="p-3 md:p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg animate-float">
                    <div className="aspect-video rounded-lg bg-gray-100 overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1469474968028-56623f02e42e"
                        alt="Landscape photography of mountain hit by sun rays"
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
        <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-blue-100 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-yellow-300/10 mix-blend-multiply blur-3xl animate-float" style={{ animationDelay: "0.5s" }}></div>
            <div className="absolute bottom-20 left-10 w-60 h-60 rounded-full bg-pink-300/10 mix-blend-multiply blur-3xl animate-float" style={{ animationDelay: "2.5s" }}></div>
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter mb-4">Plan Together, Experience Together</h2>
              <p className="text-gray-600 md:text-lg max-w-2xl mx-auto">
                Invite friends, create shared bucket lists, and collaborate seamlessly. No more scattered chats—just effortless planning for unforgettable adventures.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <MapPin className="h-10 w-10 text-blue-500 mb-4" />
                <h3 className="font-bold mb-2">Travel Plans</h3>
                <p className="text-gray-600">Map your dream destinations and upcoming adventures.</p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <ListChecks className="h-10 w-10 text-blue-500 mb-4" />
                <h3 className="font-bold mb-2">Taste Trails</h3>
                <p className="text-gray-600">Track restaurants, whiskies, cuisines, and more.</p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <Users className="h-10 w-10 text-blue-500 mb-4" />
                <h3 className="font-bold mb-2">Social Outings</h3>
                <p className="text-gray-600">Coordinate group activities effortlessly.</p>
              </div>
              <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                <Clock className="h-10 w-10 text-blue-500 mb-4" />
                <h3 className="font-bold mb-2">Personal Goals</h3>
                <p className="text-gray-600">Skills to learn, books to read, milestones to reach.</p>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tighter mb-4">Track Your Memories</h2>
              <p className="text-gray-600 md:text-lg max-w-2xl mx-auto mb-8">
                Check off completed experiences and build a visual timeline of your life's best moments.
              </p>
              <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600">
                <Link to="/create">
                  <Plus className="mr-2 h-5 w-5" />
                  Start Your Journey
                </Link>
              </Button>
              <p className="mt-6 text-xl font-feelfree italic text-blue-600">
                BucketNest. Dream. Plan. Share.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
