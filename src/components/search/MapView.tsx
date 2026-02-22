"use client";

import Image from "next/image";

export function MapView() {
    return (
        <div className="relative h-full w-full bg-gray-100">
            {/* Mock Map Image */}
            <Image
                src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=2662&auto=format&fit=crop"
                alt="Map view"
                fill
                className="object-cover opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none">
                <span className="bg-white px-4 py-2 rounded-lg shadow-lg font-bold text-gray-800">
                    Carte interactive (Maps API Demo)
                </span>
            </div>

            {/* Mock Pins */}
            <div className="absolute top-1/4 left-1/3 p-2 bg-white rounded-xl shadow-xl font-bold text-sm transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform cursor-pointer">
                20€
            </div>
            <div className="absolute top-1/2 left-1/2 p-2 bg-primary text-white rounded-xl shadow-xl font-bold text-sm transform -translate-x-1/2 -translate-y-1/2 z-10 scale-110">
                45€
            </div>
            <div className="absolute bottom-1/3 right-1/4 p-2 bg-white rounded-xl shadow-xl font-bold text-sm transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform cursor-pointer">
                35€
            </div>
        </div>
    );
}
