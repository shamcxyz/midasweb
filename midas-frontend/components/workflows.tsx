import Image from "next/image";
import WorflowImg01 from "@/public/images/workflow-01.png";
import WorflowImg02 from "@/public/images/workflow-02.png";
import WorflowImg03 from "@/public/images/workflow-03.png";
import Spotlight from "@/components/spotlight";

export default function Workflows() {
  const workflows = [
    {
      title: "Automated Policy Checks",
      description:
        "Ensure every submission complies with your financial policies before it reaches an approver.",
    },
    {
      title: "Seamless ERP Integration",
      description: "Works with your existing systems like SAP and NetSuite.",
    },
    {
      title: "AI-Powered Validation",
      description:
        "AI checks compliance instantly, ensuring accuracy and consistency.",
    },
    {
      title: "Automate and Grow",
      description:
        "Eliminate busywork by automating repetitive administrative tasks.",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-[#fdf7f5] to-[#f7ede9] pt-12 md:pt-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="pb-12 md:pb-20">
          {/* Section header */}
          <div className="mx-auto max-w-2xl pb-12 text-center md:pb-20">
            <h2 className="text-3xl font-serif font-semibold text-gray-800 md:text-4xl">
              Why Choose Midas?
            </h2>
          </div>

          {/* Workflow cards */}
          <div className="grid gap-8 sm:grid-cols-2 md:gap-12">
            {workflows.map((workflow, index) => (
              <div
                key={index}
                className="flex items-start gap-6 p-6 rounded-2xl bg-[#fefaf6] shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4a4e69]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="text-white"
                  >
                    <path
                      d="M9 11l3 3L22 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 12v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {/* Text */}
                <div>
                  <h3 className="text-lg font-serif font-semibold text-gray-800">
                    {workflow.title}
                  </h3>
                  <p className="text-gray-600">{workflow.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}