import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/layout/Navigation";
import { Plus } from "lucide-react";

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
                    <span className="font-normal">Plan your</span> <span className="font-feelfree italic text-blue-300">experiences</span>
                  </h1>
                  <p className="mt-4 text-gray-200 md:text-xl">
                    BucketNest helps you organize all your planned experiences - 
                    from weekend restaurant visits to dream vacations.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600">
                    <Link to="/create">
                      <Plus className="mr-2 h-5 w-5" />
                      Add New Experience
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

        {/* CTA section */}
        <section className="py-16 md:py-24 bg-blue-50">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl max-w-xl mx-auto">
              Start Planning Your Next Experience
            </h2>
            <p className="mt-4 text-gray-500 md:text-xl max-w-2xl mx-auto mb-8">
              From a dinner date this weekend to your dream vacation - track everything in one place.
            </p>
            <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600">
              <Link to="/create">
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Experience
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
