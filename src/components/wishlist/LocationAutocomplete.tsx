
import { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Location {
  city?: string;
  country?: string;
  formatted: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

const LocationAutocomplete = ({ value, onChange }: LocationAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    const fetchLocations = async () => {
      if (inputValue.length < 3) {
        setLocations([]);
        return;
      }

      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            inputValue
          )}&apiKey=e3ceb15f23c544ac82e43add8dd3e5ad`
        );
        const data = await response.json();
        const formattedLocations = data.features.map((feature: any) => ({
          city: feature.properties.city,
          country: feature.properties.country,
          formatted: feature.properties.formatted,
        }));
        setLocations(formattedLocations);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations([]);
      }
    };

    const timeoutId = setTimeout(fetchLocations, 300);
    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value || "Select destination..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search destination..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {locations.map((location, index) => (
              <CommandItem
                key={index}
                value={location.formatted}
                onSelect={(currentValue) => {
                  onChange(currentValue);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === location.formatted ? "opacity-100" : "opacity-0"
                  )}
                />
                {location.formatted}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default LocationAutocomplete;
