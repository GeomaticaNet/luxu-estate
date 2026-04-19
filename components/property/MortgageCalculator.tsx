interface Props {
  price: number;
}

export const MortgageCalculator = ({ price }: Props) => {
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
          <h3 className="font-semibold text-nordic">Estimated Payment</h3>
          <p className="text-sm text-nordic/60">
            Starting from <strong className="text-mosque">{estimatedPayment}/mo</strong> with 20% down
          </p>
        </div>
      </div>
      <button className="whitespace-nowrap px-4 py-2 bg-white border border-nordic/10 rounded-lg text-sm font-semibold hover:border-mosque transition-colors text-nordic">
        Calculate Mortgage
      </button>
    </div>
  );
};
