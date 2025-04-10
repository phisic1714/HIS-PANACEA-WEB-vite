import { useEffect, useState } from "react";

export const useDatetime = () => {
    const [seconds, setSeconds] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const date = new Date();
            setSeconds(
                date.toLocaleDateString("th-TH", {
                    timeZone: "Asia/Bangkok",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "long",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                })
            );
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return seconds;
};
