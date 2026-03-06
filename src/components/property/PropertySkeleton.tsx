import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PropertySkeleton() {
    return (
        <Card className="group overflow-hidden">
            {/* Image Placeholder */}
            <div className="relative h-56 w-full">
                <Skeleton className="h-full w-full rounded-none" />
                {/* Badges Placeholders */}
                <div className="absolute top-3 left-3 flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                {/* Favorite Button Placeholder */}
                <Skeleton className="absolute top-3 right-3 h-10 w-10 rounded-md" />
            </div>

            <CardContent className="p-4">
                {/* Price Placeholder */}
                <div className="mb-2">
                    <Skeleton className="h-8 w-1/3" />
                </div>

                {/* Title Placeholder */}
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-3/4 mb-3" />

                {/* Location Placeholder */}
                <div className="flex items-center mb-4">
                    <Skeleton className="h-4 w-4 mr-2" />
                    <Skeleton className="h-4 w-1/2" />
                </div>

                {/* Features Placeholder */}
                <div className="flex gap-4 mb-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>

                {/* Owner/Agency Placeholder */}
                <div className="pt-3 border-t border-gray-100">
                    <Skeleton className="h-4 w-1/3" />
                </div>
            </CardContent>
        </Card>
    );
}
