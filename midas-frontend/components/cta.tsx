import Image from "next/image";
import BlurredShape from "@/public/images/blurred-shape.svg";

export default function Cta() {
  return (
    <section className="relative overflow-hidden bg-[#fefaf6] w-full">
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-24 ml-20 -translate-x-1/2"
        aria-hidden="true"
      >
        <Image
          className="max-w-none"
          src={BlurredShape}
          width={760}
          height={668}
          alt="Blurred shape"
        />
      </div>
      <div className="w-full px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#ffffff] via-[#f7ede9]/60 to-[#ffffff] py-12 md:py-20 rounded-lg shadow-lg">
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className="pb-8 font-serif text-3xl font-semibold text-gray-800 md:text-4xl"
              data-aos="fade-up"
            >
              Ready to Transform Your Approvals?
            </h2>
            <div className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center">
              <div data-aos="fade-up" data-aos-delay={600}>
                <a
                  className="btn relative w-full bg-gradient-to-b from-[#4a4e69] to-[#4a4e69]/80 text-white rounded-md shadow-lg hover:shadow-xl transition-shadow duration-300 sm:ml-4 sm:w-auto px-6 py-3 font-medium hover:bg-opacity-90"
                  href="#0"
                >
                  Join Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
