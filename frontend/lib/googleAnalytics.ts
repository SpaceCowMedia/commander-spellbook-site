export const GA_TRACKING_ID = "G-357BGWEVLV";

export const pageview = (url: string) => {
  const gdprIsAccepted = localStorage.getItem("GDPR:accepted") === "true"
  if (!gdprIsAccepted) return;
  // @ts-ignore
  window.gtag && window.gtag("config", GA_TRACKING_ID, {
    page_path: url,
  });
};

type EventProps = {
  action: string;
  category?: string;
  label?: string;
  value?: string;
}

export const event = ({ action, category, label, value }: EventProps) => {
  const gdprIsAccepted = localStorage.getItem("GDPR:accepted") === "true"
  if (!gdprIsAccepted) return;
  // @ts-ignore
  window.gtag && window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
