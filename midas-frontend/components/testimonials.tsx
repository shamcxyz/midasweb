import { useState } from "react";
import Image from "next/image";
import DukeLogo from "@/public/images/dukelogo.png";
import NYULogo from "@/public/images/nyulogo.png";

const logos = [
  { logo: DukeLogo, name: "Duke University" },
  { logo: NYULogo, name: "NYU" },
];

export default function Partners() {
  return (
    <section className="w-full bg-gradient-to-b from-[#fdf7f5] to-[#f7ede9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t py-16 md:py-24">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center">
            <h2 className="text-4xl font-serif font-semibold text-gray-800 md:text-5xl">
              Our Partners
            </h2>
            <p className="text-lg text-gray-600">
              We’re proud to collaborate with prestigious institutions.
            </p>
          </div>

          {/* Logos */}
          <div className="flex flex-wrap justify-center gap-12">
            {logos.map((institution, index) => (
              <div key={index} className="flex items-center p-4 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
                <Image
                  src={institution.logo}
                  alt={`${institution.name} logo`}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
