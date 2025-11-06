import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";

function Clock() {
  const { darkMode } = useTheme();
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nepaliWeekdays = {
    Sunday: "आइतबार",
    Monday: "सोमबार",
    Tuesday: "मङ्गलबार",
    Wednesday: "बुधबार",
    Thursday: "बिहीबार",
    Friday: "शुक्रबार",
    Saturday: "शनिबार",
  };

  const weekdayEn = currentTime.toLocaleString("en-US", { weekday: "long" });
  const weekday = t(nepaliWeekdays[weekdayEn], weekdayEn);

  const time = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  const formattedTime = `${weekday}, ${time}`;
  return (
    <time
      dateTime={currentTime.toISOString()}
      className={`text-sm font-medium ${
        darkMode ? "text-white" : "text-black"
      } hidden sm:block`}
    >
      {formattedTime}
    </time>
  );
}

export default Clock;
