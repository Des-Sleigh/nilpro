"use client";

import { useEffect, useState } from "react";

type Deal = { name: string; school: string; biz: string; deal: string };

const POOL: Deal[] = [
  { name: "MAYA R.", school: "MVNU SOCCER", biz: "LOCAL TEX-MEX", deal: "$75/POST" },
  { name: "JORDAN T.", school: "OHIO JUCO BASEBALL", biz: "FITNESS CLUB", deal: "GYM + $50/POST" },
  { name: "SAM K.", school: "OREGON TRACK", biz: "RUNNING SHOP", deal: "GEAR + $250" },
  { name: "TYLER M.", school: "D2 LACROSSE", biz: "BARBER SHOP", deal: "CUT + $40/POST" },
  { name: "ALYSSA P.", school: "D3 VOLLEYBALL", biz: "JUICE BAR", deal: "MEALS + $50/POST" },
  { name: "MARCUS L.", school: "HS FOOTBALL", biz: "PIZZERIA", deal: "MEALS + $35/POST" },
  { name: "ELENA G.", school: "NAIA SOFTBALL", biz: "COFFEE SHOP", deal: "MEALS + $30/POST" },
  { name: "DEVIN O.", school: "D1 BASKETBALL", biz: "CAR WASH", deal: "$150/APPEARANCE" },
  { name: "RAYA W.", school: "HS TENNIS", biz: "SMOOTHIE BAR", deal: "SMOOTHIES + $25/POST" },
  { name: "CHRIS P.", school: "D2 WRESTLING", biz: "SUPPLEMENT SHOP", deal: "PRODUCT + $60/POST" },
  { name: "NINA A.", school: "D3 SWIM", biz: "YOGA STUDIO", deal: "MEMBERSHIP + 2 POSTS" },
  { name: "BEN H.", school: "JUCO GOLF", biz: "GOLF COURSE", deal: "PLAY + $100/APPEARANCE" },
  { name: "KAIA M.", school: "HS CHEER", biz: "NAIL SALON", deal: "SERVICE + $40/POST" },
  { name: "DANTE R.", school: "NAIA SOCCER", biz: "BURGER JOINT", deal: "MEALS + $45/POST" },
  { name: "LILY C.", school: "D1 GYMNASTICS", biz: "DANCE STUDIO", deal: "CLASSES + $75/POST" },
  { name: "OMAR K.", school: "HS BASEBALL", biz: "SPORTING GOODS", deal: "GEAR + $40/POST" },
  { name: "AVA S.", school: "D3 CROSS COUNTRY", biz: "HEALTH FOOD STORE", deal: "$50 + DISCOUNT" },
  { name: "ISAAC B.", school: "D2 FOOTBALL", biz: "AUTO DETAIL SHOP", deal: "$125/APPEARANCE" },
  { name: "HARPER L.", school: "HS FIELD HOCKEY", biz: "ICE CREAM SHOP", deal: "MEALS + $30/POST" },
  { name: "KWAME J.", school: "D1 TRACK", biz: "RUNNING CLUB", deal: "COACHING + $80/POST" },
  { name: "SOFIA V.", school: "NAIA BASKETBALL", biz: "BOUTIQUE", deal: "CLOTHING + $50/POST" },
  { name: "GRAYSON T.", school: "HS HOCKEY", biz: "PRO SHOP", deal: "GEAR + $40/POST" },
  { name: "ZARA F.", school: "D3 LACROSSE", biz: "PILATES STUDIO", deal: "CLASSES + $60/POST" },
  { name: "LUCAS M.", school: "JUCO WRESTLING", biz: "CROSSFIT GYM", deal: "MEMBERSHIP + 2 POSTS" },
  { name: "RILEY D.", school: "HS GOLF", biz: "DRIVING RANGE", deal: "RANGE + $35/POST" },
  { name: "TRINITY W.", school: "D2 VOLLEYBALL", biz: "CAFE", deal: "MEALS + $40/POST" },
  { name: "JULIAN H.", school: "D1 TENNIS", biz: "RACQUET CLUB", deal: "MEMBERSHIP + $100" },
  { name: "MILA K.", school: "HS SWIM", biz: "SWIM SCHOOL", deal: "LESSONS + $40/POST" },
  { name: "ANDRE N.", school: "NAIA FOOTBALL", biz: "BBQ JOINT", deal: "MEALS + $55/POST" },
  { name: "QUINN A.", school: "D3 SOCCER", biz: "BIKE SHOP", deal: "GEAR + $45/POST" },
  { name: "TANNER R.", school: "HS BASKETBALL", biz: "SHOE STORE", deal: "SHOES + $60/POST" },
  { name: "NAOMI P.", school: "D2 TRACK", biz: "ATHLETIC STORE", deal: "GEAR + $50/POST" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TickerBar() {
  // Render a stable initial order on SSR (first 10 of POOL), then shuffle on the client
  // after mount — prevents hydration mismatch from Math.random.
  const [picked, setPicked] = useState<Deal[]>(() => POOL.slice(0, 10));

  useEffect(() => {
    setPicked(shuffle(POOL).slice(0, 10));
  }, []);

  const doubled = [...picked, ...picked];

  return (
    <div className="ticker-bar">
      <div className="ticker-inner">
        <div className="ticker-label">LIVE DEALS</div>
        <div className="ticker-scroll">
          {doubled.map((d, i) => (
            <span className="ticker-item" key={i}>
              <strong>{d.name}</strong> — {d.school} · {d.biz} ·{" "}
              <span className="amt">{d.deal}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
