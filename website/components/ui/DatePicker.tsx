import { useState, useEffect } from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"

import { cn } from "@/lib/utils/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { TimePicker } from "@/components/ui/time"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date: number | undefined;
    setDate: (date: number | undefined) => void;
}

export default function DateAndTimePicker({ date, setDate }: DatePickerProps) {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>(
    date ? new Date(date) : undefined
  );

  useEffect(() => {
    if (date) {
      setSelectedDateTime(new Date(date));
    }
  }, [date]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const updatedDateTime = new Date(newDate);
      if (selectedDateTime) {
        updatedDateTime.setHours(selectedDateTime.getHours());
        updatedDateTime.setMinutes(selectedDateTime.getMinutes());
      }
      setSelectedDateTime(updatedDateTime);
      setDate(updatedDateTime.getTime());
    } else {
      setSelectedDateTime(undefined);
      setDate(undefined);
    }
  };

  const handleTimeChange = (newDate: Date) => {
    if (selectedDateTime) {
      const updatedDateTime = new Date(selectedDateTime);
      updatedDateTime.setHours(newDate.getHours());
      updatedDateTime.setMinutes(newDate.getMinutes());
      setSelectedDateTime(updatedDateTime);
      setDate(updatedDateTime.getTime());
    } else {
      setSelectedDateTime(newDate);
      setDate(newDate.getTime());
    }
  };

  return (
    <div className="flex flex-col">
      <label htmlFor="datetime" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Date and Time
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="datetime"
            variant={"outline"}
            className={cn(
              "w-[240px] pl-3 text-left font-normal",
              !selectedDateTime && "text-muted-foreground"
            )}
          >
            {selectedDateTime ? (
              format(selectedDateTime, "PPP HH:mm")
            ) : (
              <span>Pick a date and time</span>
            )}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDateTime}
            onSelect={handleDateChange}
            initialFocus
          />
          <div className="p-3 border-t border-border">
            <TimePicker
              date={selectedDateTime || new Date()}
              setDate={handleTimeChange}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}