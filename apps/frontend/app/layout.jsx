/* eslint-disable react/prop-types */

export const metadata = {
  title: "CRMS Client Portal",
  description: "Change & Requirement Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          * {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f8fafc;
          }

          *::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }

          *::-webkit-scrollbar-track {
            background: #f8fafc;
            border-radius: 999px;
          }

          *::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 999px;
            border: 2px solid #f8fafc;
          }

          *::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </head>
      <body
        style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f3f4f6" }}
      >
        {children}
      </body>
    </html>
  );
}
