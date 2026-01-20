import React from "react";

interface CurrencyFormatterProps {
    amount: number;
    currency?: string;
    locale?: string;
}

const CurrencyFormatter: React.FC<CurrencyFormatterProps> = ({
    amount,
    currency = "USD",
    locale = "en-US",
}) => {
    const formattedAmount = new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
    }).format(amount);

    return <span className="font-medium text-gray-900">{formattedAmount}</span>;
};

export default CurrencyFormatter;
