"use client";

import Image from "next/image";


const CATEGORIES = [
    { name: "Barbier", image: "https://images.unsplash.com/photo-1621644827024-e8a6c903fb1a?q=80&w=300&auto=format&fit=crop" },
    { name: "Cheveux Afro", image: "https://images.unsplash.com/photo-1512663150964-d8f58b9d5a96?q=80&w=300&auto=format&fit=crop" },
    { name: "Coloration", image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=300&auto=format&fit=crop" },
    { name: "Mariage", image: "https://images.unsplash.com/photo-1521590832896-40223f88647e?q=80&w=300&auto=format&fit=crop" },
    { name: "Tresses", image: "https://images.unsplash.com/photo-1512663150964-d8f58b9d5a96?q=80&w=300&auto=format&fit=crop" }, // Reuse Afro for stability
    { name: "Soins", image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=300&auto=format&fit=crop" },
];

export function Categories() {
    return (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-8 min-w-max px-2">
                {CATEGORIES.map((cat, index) => (
                    <div key={index} className="flex flex-col items-center gap-3 group cursor-pointer">
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-2 border-transparent transition-all group-hover:border-primary group-hover:scale-105 shadow-md">
                            <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="text-sm sm:text-base font-medium text-foreground group-hover:text-primary transition-colors">
                            {cat.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
