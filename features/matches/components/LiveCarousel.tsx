"use client";
import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { MatchCard } from "./MatchCard";
import { Match } from "@/types";

export const LiveCarousel = ({ matches }: { matches: Match[] }) => {
  const plugin = React.useRef(
    Autoplay({ 
      delay: 2000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  );

  return (
    <div className="w-full mb-16 px-8 max-w-full overflow-hidden relative">
      <Carousel
        plugins={[plugin.current]}
        className="w-full overflow-hidden"
        opts={{
          align: "start",
          loop: true,
          containScroll: "trimSnaps",         }}
      >
        <CarouselContent className="flex gap-6 w-full max-w-full">
          {matches.map((match) => (
            <CarouselItem
              key={match.id}
              className="min-w-0 shrink-0 basis-[80%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <MatchCard match={match} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
