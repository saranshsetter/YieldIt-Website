import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ThankYou() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-[#1D9E75]" />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl text-[#111827] mb-4">
          You&apos;re on the list.
        </h1>
        <p className="text-[#6B7280] text-lg leading-relaxed mb-8">
          We received your audit request. Our team will analyze your online presence
          and send you a personalized report within{" "}
          <span className="font-semibold text-[#111827]">48 hours</span>.
        </p>
        <div className="bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] p-6 mb-8 text-left">
          <h2 className="font-semibold text-[#111827] text-sm mb-3">
            What happens next:
          </h2>
          <ul className="flex flex-col gap-3">
            {[
              "We run a full audit of your Google rankings, ads, and reviews",
              "We identify your biggest growth opportunities",
              "We send you a report with specific, actionable recommendations",
              "You decide if you want our help implementing them",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#374151]">
                <span className="w-5 h-5 rounded-full bg-[#E1F5EE] text-[#085041] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-[#E5E7EB] text-[#111827] font-semibold text-sm hover:border-[#1D9E75] hover:text-[#1D9E75] transition-all"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
