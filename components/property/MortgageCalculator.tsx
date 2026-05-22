"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  price: number;
}

function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const payments = years * 12;
  if (monthlyRate === 0) return principal / payments;
  const factor = Math.pow(1 + monthlyRate, payments);
  return principal * (monthlyRate * factor) / (factor - 1);
}

export const MortgageCalculator = ({ price }: Props) => {
  const t = useTranslations("PropertyDetails");
  const [expanded, setExpanded] = useState(false);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);

  const downPayment = price * (downPaymentPct / 100);
  const loanAmount = price - downPayment;
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, loanTerm);

  const formatCurrency = (val: number) =>
    val.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  return (
    <div className="bg-mosque/5 p-6 rounded-xl border border-mosque/10">
      {/* Collapsed summary row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-full text-mosque shadow-sm">
            <span className="material-icons">calculate</span>
          </div>
          <div>
            <h3 className="font-semibold text-nordic">{t("estimated_payment")}</h3>
            <p className="text-sm text-nordic/60">
              {t("starting_from")} <strong className="text-mosque">{formatCurrency(monthlyPayment)}{t("per_month")}</strong> {t("with_down_payment")}
            </p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="whitespace-nowrap px-4 py-2 bg-white border border-nordic/10 rounded-lg text-sm font-semibold hover:border-mosque transition-colors text-nordic flex items-center gap-2"
        >
          {expanded ? t("hide_calculator") : t("calculate")}
          <span className={`material-icons text-base transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
            expand_more
          </span>
        </button>
      </div>

      {/* Expanded interactive calculator */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          expanded ? "max-h-[500px] opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        <div className="border-t border-mosque/10 pt-6 space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-2">
            <div className="bg-white p-3 rounded-lg text-center">
              <div className="text-xs text-nordic/50 uppercase tracking-wider">{t("loan_amount")}</div>
              <div className="text-lg font-bold text-nordic">{formatCurrency(loanAmount)}</div>
            </div>
            <div className="bg-white p-3 rounded-lg text-center">
              <div className="text-xs text-nordic/50 uppercase tracking-wider">{t("down_payment")}</div>
              <div className="text-lg font-bold text-mosque">{formatCurrency(downPayment)}</div>
            </div>
            <div className="bg-white p-3 rounded-lg text-center col-span-2 sm:col-span-2">
              <div className="text-xs text-nordic/50 uppercase tracking-wider">{t("monthly_payment")}</div>
              <div className="text-2xl font-bold text-mosque">{formatCurrency(monthlyPayment)}{t("per_month")}</div>
            </div>
          </div>

          {/* Down Payment slider */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-nordic/70">{t("down_payment_pct")}</span>
              <span className="font-semibold text-nordic">{downPaymentPct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-mosque [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-mosque [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>

          {/* Interest Rate slider */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-nordic/70">{t("interest_rate")}</span>
              <span className="font-semibold text-nordic">{interestRate}%</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={0.25}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-mosque [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-mosque [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>

          {/* Loan Term slider */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-nordic/70">{t("loan_term")}</span>
              <span className="font-semibold text-nordic">{loanTerm} {t("years")}</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              step={5}
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-mosque [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-mosque [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
