"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question:
      "How does Credify guarantee that jobs are not 'ghost' or phantom listings?",
    answer:
      "Unlike legacy job aggregators that crawl expired or abandoned internet listings, every role on Credify is directly published by an authenticated corporate employer with confirmed hiring budget. Roles are bound by response SLAs and automatically expire or re-verify every 30 days to ensure 100% genuine hiring intent.",
  },
  {
    question: "Is Credify completely free for candidates and job seekers?",
    answer:
      "Yes, 100% free forever. There are zero paywalls, premium tiers, or hidden application fees. You can build your verified profile, connect GitHub and portfolio proof, search all opportunities, and track your applications completely free.",
  },
  {
    question: "How does candidate skill and portfolio verification work?",
    answer:
      "Credify connects directly with authentic developer footprints: GitHub repositories, open-source commits, live URLs, and verified work history. This replaces keyword-stuffed resumes with tangible proof of craft, giving hiring managers immediate trust in your real technical capabilities.",
  },
  {
    question:
      "What is the Application Pipeline Radar and the 48h Response SLA?",
    answer:
      "The Application Pipeline Radar provides complete transparency into where your application stands in real time: Submitted, Under Review, Technical Screen, or Final Offer. Hiring teams commit to regular status updates, ending the frustration of never hearing back.",
  },
  {
    question: "Can I keep my job search private from my current company?",
    answer:
      "Absolutely. Credify offers granular privacy controls that allow you to block specific companies and corporate domains from discovering your profile or viewing your availability status.",
  },
  {
    question: "How do employers and recruiters get started on Credify?",
    answer:
      "Hiring managers register with their verified corporate email and company domain. Once verified, teams can post roles with upfront compensation bands, review pre-vetted candidate pools, and manage their hiring pipeline with zero agency middlemen.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggleFaq(index: number) {
    setOpenIndex((prev) => (prev === index ? null : index));
  }

  return (
    <section className="relative border-t border-slate-200/80 bg-slate-50/50 px-5 py-16 sm:px-6 sm:py-24 lg:px-8 dark:border-white/5 dark:bg-slate-950/40">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200/80 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800 dark:border-cyan-500/30 dark:bg-cyan-950/40 dark:text-cyan-300">
            <HelpCircle className="h-3 w-3" />
            Common Questions
          </div>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base dark:text-slate-300">
            Everything you need to know about verification, privacy, and hiring
            on Credify.
          </p>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all dark:border-white/10 dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-50/80 sm:p-6 dark:hover:bg-slate-800/50"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen
                        ? "rotate-180 text-cyan-600 dark:text-cyan-400"
                        : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-5 pt-3 pb-5 sm:px-6 sm:pb-6 dark:border-white/5">
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
