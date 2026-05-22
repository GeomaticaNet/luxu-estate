import { useTranslations } from "next-intl";

interface Props {
  price: number;
}

export const MortgageCalculator = ({ price }: Props) => {
  const t = useTranslations("PropertyDetails");
  // A simple static calculation, 20% down, 5% interest etc.
  const estimatedPayment = ((price * 0.8) * 0.005).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });

  return (
    <div className="bg-mosque/5 p-6 rounded-xl border border-mosque/10 flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-full text-mosque shadow-sm">
          <span className="material-icons">calculate</span>
        </div>
        <div>
          <h3 className="font-semibold text-nordic">{t("estimated_payment")}</h3>
          <p className="text-sm text-nordic/60">
            {t("starting_from")} <strong className="text-mosque">{estimatedPayment}{t("per_month")}</strong> {t("with_down_payment")}
          </p>
        </div>
      </div>
      <button className="whitespace-nowrap px-4 py-2 bg-white border border-nordic/10 rounded-lg text-sm font-semibold hover:border-mosque transition-colors text-nordic">
        {t("calculate")}
      </button>
    </div>
  );
};
