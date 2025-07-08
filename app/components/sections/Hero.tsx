"use client";

import React, { useEffect, useState } from "react";
import Card from "@/app/components/ui/Card";
import { AudioLines, ThermometerSun, Waves } from "lucide-react";

type Reading = {
  temperature: number;
  humidity: number;
  sound: number;
  filterLevel: number;
  timestamp: string;
};

const Hero = () => {
  const [latest, setLatest] = useState<Reading | null>(null);
  const [previous, setPrevious] = useState<Reading | null>(null);

  useEffect(() => {
    const fetchLatest = async () => {
      const res = await fetch("/api/sensor?minutes=10");
      const data: Reading[] = await res.json();

      if (data.length > 0) {
        setLatest(data[0]);
        setPrevious(data[1] || null);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-20">
      <div className="flex flex-col gap-16 md:flex-row md:gap-6">
        <Card
          currentReading={latest?.temperature ?? null}
          previousReading={previous?.temperature ?? null}
          icon={<ThermometerSun className="h-6 w-6" />}
          title="Temperature"
          type="temperature"
        />
        <Card
          currentReading={latest?.humidity ?? null}
          previousReading={previous?.humidity ?? null}
          icon={<Waves className="h-6 w-6" />}
          title="Humidity"
          type="humidity"
        />
        <Card
          currentReading={latest?.sound ?? null}
          sensitivityLevel={latest?.filterLevel ?? null}
          icon={<AudioLines className="h-6 w-6" />}
          title="Sound"
          type="sound"
        />
      </div>
    </section>
  );
};

export default Hero;
