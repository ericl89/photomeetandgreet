"use client";
import { useEffect, useState } from "react";

export function useMember() {
    const [state, set] = useState<{ loading: boolean; user: any | null }>({ loading: true, user: null });
    useEffect(() => {
        (async () => {
            const r = await fetch("/api/member/me", { credentials: "include" });
            console.log("r: ",r);
            const data = await r.json();
            console.log("r data: ",data);
            set({ loading: false, user: r.ok ? data[0] : null });
        })();
    }, []);
    return state;
}