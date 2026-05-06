"use client";
import React, { useCallback } from "react";
import { ExternalLink, Facebook, ThumbsUp, Repeat2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Autoplay from "embla-carousel-autoplay";

const mockNews = [
  {
    id: 1,
    outlet: "Cebu Daily News",
    date: "February 24, 2026",
    title: "UP Cebu Maroons Clinch UAAP Season 87 Finals Berth",
    excerpt:
      "The UP Cebu Maroons secured their spot in the UAAP Season 87 Finals after a thrilling overtime win against the UST Growling Tigers, 78–74, in a packed FilOil EcoOil Centre.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80",
    url: "#",
    likes: 4200,
    shares: 831,
  },
  {
    id: 2,
    outlet: "Philippine Star Sports",
    date: "February 20, 2026",
    title: "Maroons' Guard Named UAAP Player of the Week",
    excerpt:
      "UP Cebu's star point guard was named UAAP Player of the Week after averaging 22 points, 7 assists, and 4 steals in back-to-back wins, electrifying fans with clutch fourth-quarter performances.",
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80",
    url: "#",
    likes: 3100,
    shares: 512,
  },
  {
    id: 3,
    outlet: "Spin.ph",
    date: "February 17, 2026",
    title: "UP Cebu Completes Incredible Second-Round Sweep",
    excerpt:
      "The UP Cebu Maroons made history by completing a perfect second-round sweep, becoming only the third team in UAAP history to achieve the feat, entering the Final Four as the No. 1 seed.",
    image: "https://images.unsplash.com/photo-1627627256672-027a4613d028?w=600&q=80",
    url: "#",
    likes: 8900,
    shares: 2300,
  },
  {
    id: 4,
    outlet: "GMA Sports",
    date: "February 12, 2026",
    title: "Maroons Stun No. 1 Ateneo in Upset of the Season",
    excerpt:
      "In what analysts are calling the biggest upset of the UAAP season, the UP Cebu Maroons defeated the heavily favored Ateneo Blue Eagles 85–79, sending shockwaves through the standings.",
    image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80",
    url: "#",
    likes: 11400,
    shares: 3800,
  },
  {
    id: 5,
    outlet: "ESPN5 Philippines",
    date: "February 8, 2026",
    title: "Head Coach Extends Contract, Commits Future to UP Cebu",
    excerpt:
      "UP Cebu head coach signed a three-year contract extension, citing the university's unwavering support and the team's bright future as key factors in his decision.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
    url: "#",
    likes: 5600,
    shares: 970,
  },
];

function formatCount(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function NewsCarousel() {
  // Create the plugin instance OUTSIDE of render with useRef so it's stable
  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  return (
    <section className="relative w-full bg-neutral-950 py-20 px-4 overflow-hidden">
      {/* Subtle top/bottom rule lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-[#A91D3A]/50 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-[#A91D3A]/50 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#A91D3A] mb-3">
            <span className="w-6 h-0.5 bg-[#A91D3A] inline-block" />
            News &amp; Updates
          </span>
          <h2 className="font-heading text-4xl md:text-5xl text-white leading-tight">
            In The Media
          </h2>
        </div>

        <Carousel
          plugins={[autoplayPlugin.current]}
          opts={{ loop: true }}
          className="w-full"
        >
          <CarouselContent>
            {mockNews.map((item) => (
              <CarouselItem key={item.id}>
                <Card className="border border-white/8 bg-neutral-900/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2">
                      {/* Image */}
                      <div className="relative h-64 md:h-auto overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-transparent to-transparent md:bg-gradient-to-r" />
                        <Badge className="absolute top-4 left-4 flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#1877F2] text-white text-xs font-semibold px-3 py-1.5 rounded-full border-0">
                          <Facebook size={11} />
                          Facebook
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col justify-between p-8 md:p-10">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-semibold text-[#A91D3A] uppercase tracking-widest">
                              {item.outlet}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/20 inline-block" />
                            <span className="text-xs text-white/40">{item.date}</span>
                          </div>

                          <h3 className="font-heading text-2xl md:text-3xl text-white leading-snug mb-4">
                            {item.title}
                          </h3>

                          <p className="text-sm text-white/55 leading-relaxed line-clamp-3">
                            {item.excerpt}
                          </p>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-white/30">
                            <span className="flex items-center gap-1.5">
                              <ThumbsUp size={12} />
                              {formatCount(item.likes)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Repeat2 size={12} />
                              {formatCount(item.shares)}
                            </span>
                          </div>

                          <a
                            href={item.url}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-[#A91D3A] transition-colors duration-200 group"
                          >
                            Read post
                            <ExternalLink
                              size={12}
                              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                            />
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="flex items-center justify-center gap-3 mt-6">
            <CarouselPrevious className="static translate-y-0 w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-[#A91D3A] hover:border-[#A91D3A] hover:text-white text-white transition-all duration-200" />
            <CarouselNext className="static translate-y-0 w-10 h-10 rounded-full border border-white/10 bg-white/5 hover:bg-[#A91D3A] hover:border-[#A91D3A] hover:text-white text-white transition-all duration-200" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
