"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
    min?: number
    max?: number
    step?: number
    value?: number[]
    onValueChange?: (value: number[]) => void
    className?: string
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    ({ className, min = 0, max = 100, step = 1, value = [0, 100], onValueChange, ...props }, ref) => {
        const [localValue, setLocalValue] = React.useState(value)

        React.useEffect(() => {
            setLocalValue(value)
        }, [value])

        const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newMin = Number(e.target.value)
            const newValue = [newMin, localValue[1]]
            setLocalValue(newValue)
            onValueChange?.(newValue)
        }

        const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newMax = Number(e.target.value)
            const newValue = [localValue[0], newMax]
            setLocalValue(newValue)
            onValueChange?.(newValue)
        }

        return (
            <div ref={ref} className={cn("space-y-2", className)} {...props}>
                <div className="flex gap-4">
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={localValue[0]}
                        onChange={handleMinChange}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={localValue[1]}
                        onChange={handleMaxChange}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>
            </div>
        )
    }
)
Slider.displayName = "Slider"

export { Slider }
