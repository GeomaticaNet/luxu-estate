"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ContactModal } from "./ContactModal";

interface PropertyContactSectionProps {
  isUnavailable: boolean;
  isSold: boolean;
  propertyId: string;
  propertyTitle: string;
}

export function PropertyContactSection({ isUnavailable, isSold, propertyId, propertyTitle }: PropertyContactSectionProps) {
  const t = useTranslations("PropertyDetails");
  const [showContact, setShowContact] = useState(false);
  const [showVisit, setShowVisit] = useState(false);
  const [showNotify, setShowNotify] = useState(false);

  return (
    <>
      <div className="space-y-3">
        {isUnavailable ? (
          <>
            <button
              onClick={() => setShowNotify(true)}
              className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group"
            >
              <span className="material-icons text-xl group-hover:scale-110 transition-transform">
                notifications
              </span>
              Notify me of similar properties
            </button>
            <button
              onClick={() => setShowContact(true)}
              className="w-full bg-transparent border border-nordic/10 hover:border-mosque text-nordic/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons text-xl">mail_outline</span>
              {t("contact_agent")}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowVisit(true)}
              className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group"
            >
              <span className="material-icons text-xl group-hover:scale-110 transition-transform">
                calendar_today
              </span>
              {t("schedule_visit")}
            </button>
            <button
              onClick={() => setShowContact(true)}
              className="w-full bg-transparent border border-nordic/10 hover:border-mosque text-nordic/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons text-xl">mail_outline</span>
              {t("contact_agent")}
            </button>
          </>
        )}
      </div>

      <ContactModal
        isOpen={showContact}
        onClose={() => setShowContact(false)}
        leadType="contact"
        propertyId={propertyId}
        propertyTitle={propertyTitle}
      />

      <ContactModal
        isOpen={showVisit}
        onClose={() => setShowVisit(false)}
        leadType="visit"
        propertyId={propertyId}
        propertyTitle={propertyTitle}
      />

      <ContactModal
        isOpen={showNotify}
        onClose={() => setShowNotify(false)}
        leadType="contact"
        propertyId={propertyId}
        propertyTitle={propertyTitle}
      />
    </>
  );
}
