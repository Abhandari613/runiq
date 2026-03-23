export const metadata = {
  title: "RunIQ — Elite AI Running Coach",
  description: "Track, analyse, dominate. AI-powered running intelligence.",
  manifest: "/manifest.json",
  themeColor: "#7C5CFC",
  viewport: { width: "device-width", initialScale: 1, viewportFit: "cover" },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "RunIQ" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&family=Geist+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#060911", overflowX: "hidden" }}>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulseGlow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        `}</style>
        {children}
      </body>
    </html>
  );
}
