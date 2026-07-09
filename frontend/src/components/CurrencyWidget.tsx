"use client";
import { useState, useEffect } from "react";

export default function CurrencyWidget() {
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("EUR");
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const currencies = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF", "CNY", "THB", "SGD"];

  useEffect(() => {
    const fetchConversion = async () => {
      if (fromCurrency === toCurrency) {
        setResult(amount);
        setRate(1);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${fromCurrency}&symbols=${toCurrency}`);
        const data = await res.json();
        if (data.rates && data.rates[toCurrency]) {
          setResult(amount * data.rates[toCurrency]);
          setRate(data.rates[toCurrency]);
        }
      } catch (e) {
        console.error("Currency fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    
    // Add a small debounce
    const timeoutId = setTimeout(() => {
      fetchConversion();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [amount, fromCurrency, toCurrency]);

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-100">
      <div className="flex justify-between items-center mb-6 text-gray-500 text-xs font-bold tracking-widest">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">currency_exchange</span>
          CURRENCY
        </div>
        <span className="material-symbols-outlined text-[16px] cursor-pointer hover:text-gray-900" onClick={() => setAmount(100)}>sync</span>
      </div>

      <div className="flex items-center gap-3 relative">
        <div className="flex-1 bg-[#F9F9F9] rounded-[24px] p-4 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest mb-1">FROM</p>
          <input 
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="text-3xl font-bold text-gray-900 mb-2 w-full bg-transparent outline-none"
          />
          <div className="flex items-center justify-between text-sm font-semibold text-gray-900 border border-gray-200 bg-white rounded-lg px-2 py-1">
            <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className="bg-transparent outline-none w-full appearance-none">
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="material-symbols-outlined text-[16px] text-gray-400 pointer-events-none">expand_more</span>
          </div>
        </div>
        
        <div onClick={swapCurrencies} className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[#1C1C1E] rounded-full flex items-center justify-center text-white shadow-md z-10 border-2 border-white cursor-pointer hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
        </div>

        <div className="flex-1 bg-[#F9F9F9] rounded-[24px] p-4 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 tracking-widest mb-1">TO</p>
          <p className="text-3xl font-bold text-gray-900 mb-2 overflow-hidden text-ellipsis">
            {loading ? "..." : (result ? result.toFixed(2) : "0.00")}
          </p>
          <div className="flex items-center justify-between text-sm font-semibold text-gray-900 border border-gray-200 bg-white rounded-lg px-2 py-1">
            <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className="bg-transparent outline-none w-full appearance-none">
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="material-symbols-outlined text-[16px] text-gray-400 pointer-events-none">expand_more</span>
          </div>
        </div>
      </div>
      <p className="text-[11px] font-medium text-gray-500 mt-4 text-center">
        {rate ? `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}` : "Live Exchange Rates"}
      </p>
    </div>
  );
}
