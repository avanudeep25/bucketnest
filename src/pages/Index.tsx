
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
        <section className="relative pt-16 pb-24 md:py-24 lg:py-32 bg-[url('https://images.unsplash.com/photo-1527786356703-4b100091cd2c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1774&q=80')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 md:grid-cols-2 md:gap-16 items-center">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-800 mb-4">
                    Your Personal Bucket List Planner
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                    <span className="font-normal">Your Next Adventure Awaits!</span>
                  </h1>
                  <p className="mt-4 text-gray-200 md:text-xl">
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
                        src="https://images.unsplash.com/photo-1458668383970-8ddd3927deed"
                        alt="Map Pin Location"
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
        <section className="py-16 md:py-24 bg-blue-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter mb-4">Plan Together, Experience Together</h2>
              <p className="text-gray-600 md:text-lg max-w-2xl mx-auto">
                Invite friends, create shared bucket lists, and collaborate seamlessly. No more scattered chats—just effortless planning for unforgettable adventures.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <MapPin className="h-10 w-10 text-blue-500 mb-4" />
                <h3 className="font-bold mb-2">Travel Plans</h3>
                <p className="text-gray-600">Map your dream destinations and upcoming adventures.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <ListChecks className="h-10 w-10 text-blue-500 mb-4" />
                <h3 className="font-bold mb-2">Taste Trails</h3>
                <p className="text-gray-600">Track restaurants, whiskies, cuisines, and more.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
                <Users className="h-10 w-10 text-blue-500 mb-4" />
                <h3 className="font-bold mb-2">Social Outings</h3>
                <p className="text-gray-600">Coordinate group activities effortlessly.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-sm">
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
