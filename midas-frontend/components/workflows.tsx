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
    <section>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="pb-12 md:pb-20">
          {/* Section header */}
          <div className="mx-auto max-w-2xl pb-12 text-center md:pb-20">
            <h2 className="text-3xl font-semibold text-gray-200 md:text-4xl">
              Why Choose Midas?
            </h2>
          </div>
          
          {/* Workflow cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {workflows.map((workflow, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-6"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                  <h3 className="text-lg font-semibold text-white">
                    {workflow.title}
                  </h3>
                  <p className="text-gray-400">{workflow.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
