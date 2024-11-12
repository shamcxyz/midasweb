import Link from "next/link";

export default function HeroHome() {
  return (
    <section className="bg-gradient-to-b from-[#fdf7f5] to-[#f7ede9]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="py-12 md:py-20">
          {/* Section layout with vertical line */}
          <div className="flex flex-col md:flex-row items-center justify-center md:gap-8">
            {/* Left side - Title */}
            <div className="flex-1 md:border-r-2 border-gray-300 md:pr-8">
              <h1
                className="pb-5 font-serif text-4xl font-semibold text-gray-800 md:text-5xl text-center md:text-left"
                data-aos="fade-up"
              >
                Seamless Expense<br />
                Approvals.<br />
                Made Simple.
              </h1>
            </div>
            {/* Right side - Description and Button */}
            <div className="flex-1 mt-8 md:mt-0 md:pl-8">
              <p
                className="mb-8 text-lg text-gray-700 md:text-xl text-center md:text-left"
                data-aos="fade-up"
                data-aos-delay={200}
              >
                Automate and streamline your expense approval process with AI-driven precision. Say goodbye to delays and inconsistent approvals.
              </p>
              <div className="flex justify-center md:justify-start">
                <div data-aos="fade-up" data-aos-delay={400}>
                  <Link
                    href="/signup?admin=false"
                    className="btn group mb-4 w-full bg-[#4a4e69] text-white rounded-md shadow-lg hover:bg-[#2e2f3e] sm:mb-0 sm:w-auto px-8 py-4 text-lg font-medium transition-all duration-200"
                  >
                    Try Now
                    <span className="ml-1 inline-block text-white/70 group-hover:text-white group-hover:translate-x-1 transition-transform">
                      &rarr;
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
