
import React, { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  SortAsc, 
  Clock, 
  ArrowDown, 
  ArrowUp 
} from "lucide-react";

type SortOption = 'latest' | 'oldest' | 'title';

const Wishlist = () => {
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <SortAsc className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <DropdownMenuRadioItem value="latest">
                  <Clock className="mr-2 h-4 w-4" />
                  Latest First
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Oldest First
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="title">
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Title (A-Z)
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Wishlist content goes here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <p>Wishlist items will be displayed here</p>
      </div>
    </div>
  );
};

export default Wishlist;
