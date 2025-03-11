
import { useEffect, useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { timeframeTypes } from "@/constants/wishlistFormOptions";
import { generateMonthOptions, generateWeekOptions, getSelectedWeekText } from "@/utils/dateUtils";

interface TimeFrameSelectorProps {
  form: any;
  timePickerType: string | null;
  setTimePickerType: (type: string | null) => void;
  selectedWeekDate: Date | undefined;
  setSelectedWeekDate: (date: Date | undefined) => void;
}

const TimeFrameSelector = ({
  form,
  timePickerType,
  setTimePickerType,
  selectedWeekDate,
  setSelectedWeekDate
}: TimeFrameSelectorProps) => {
  const monthOptions = generateMonthOptions();
  const weekOptions = generateWeekOptions();

  return (
    <>
      <FormField
        control={form.control}
        name="timeframeType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>When's the Plan?</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
              }} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="When do you plan to go?" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {timeframeTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {timePickerType === 'Year' && (
        <FormField
          control={form.control}
          name="targetYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Year</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {timePickerType === 'Specific Date' && (
        <FormField
          control={form.control}
          name="targetDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Select Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "MMMM d, yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {timePickerType === 'Week' && (
        <FormField
          control={form.control}
          name="targetWeek"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Select Week</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {selectedWeekDate ? (
                        getSelectedWeekText(selectedWeekDate)
                      ) : (
                        <span>Pick a week</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedWeekDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedWeekDate(date);
                      }
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                  {selectedWeekDate && (
                    <div className="px-4 py-2 border-t border-gray-100">
                      <p className="text-sm font-medium">
                        {getSelectedWeekText(selectedWeekDate)}
                      </p>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {timePickerType === 'Month' && (
        <FormField
          control={form.control}
          name="targetMonth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Month</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select which month" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default TimeFrameSelector;
