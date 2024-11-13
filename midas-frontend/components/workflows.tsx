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
                  {index === 0 ? (
                    // Policy Checks Icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-white">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2zM9 6h6"/>
                    </svg>
                  ) : index === 1 ? (
                    // ERP Integration Icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-white">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16l3-8 3 8c-1.5 2-4.5 2-6 0zm-8 0l3-8 3 8c-1.5 2-4.5 2-6 0zm-8 0l3-8 3 8c-1.5 2-4.5 2-6 0z"/>
                    </svg>
                  ) : index === 2 ? (
                    // AI Validation Icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-white">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.5a5.5 5.5 0 014 9.28V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-1.22a5.5 5.5 0 014-9.28zM8 17h8m-4-7v4"/>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
                    </svg>
                  ) : (
                    // Automation Icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" className="text-white">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
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