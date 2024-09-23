"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TimePickerProps {
  date: Date
  setDate: (date: Date) => void
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i)

  const handleHourChange = (hour: string) => {
    const newDate = new Date(date)
    newDate.setHours(parseInt(hour))
    setDate(newDate)
  }

  const handleMinuteChange = (minute: string) => {
    const newDate = new Date(date)
    newDate.setMinutes(parseInt(minute))
    setDate(newDate)
  }

  return (
    <div className="flex items-center space-x-2">
      <Clock className="h-4 w-4 opacity-50" />
      <Select onValueChange={handleHourChange} value={date.getHours().toString()}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hourOptions.map((hour) => (
            <SelectItem key={hour} value={hour.toString()}>
              {hour.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span>:</span>
      <Select onValueChange={handleMinuteChange} value={date.getMinutes().toString()}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((minute) => (
            <SelectItem key={minute} value={minute.toString()}>
              {minute.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}