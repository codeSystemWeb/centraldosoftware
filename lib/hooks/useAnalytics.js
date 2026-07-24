"use client";

import { useEffect } from "react";
import {
  registerVisit,
  heartbeat,
  leaveSite
} from "@/lib/analytics";

export default function useAnalytics() {

  useEffect(() => {

    registerVisit();

    const timer = setInterval(() => {
      heartbeat();
    }, 30000);

    const onLeave = () => {
      leaveSite();
    };

    window.addEventListener("beforeunload", onLeave);
    window.addEventListener("pagehide", onLeave);

    return () => {

      clearInterval(timer);

      window.removeEventListener("beforeunload", onLeave);
      window.removeEventListener("pagehide", onLeave);

      leaveSite();

    };

  }, []);

}