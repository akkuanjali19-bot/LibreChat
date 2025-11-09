import React from "react";

export default function About() {
  return (
    <div className="p-8 text-center text-gray-200 min-h-screen bg-token-main-surface-primary">
      <h1 className="text-4xl font-bold mb-2">ZenoAI</h1>
      <h2 className="text-sm text-gray-400 mb-8">by NGAI</h2>

      <div className="max-w-3xl mx-auto text-base leading-relaxed text-gray-300">
        <p className="mb-4">
          <strong>ZenoAI</strong> by <strong>NGAI</strong> is a next-generation
          AI assistant designed for smart, creative, and context-aware
          conversations — all in one modern interface.
        </p>
        <p className="mb-4">
          Developed by <strong>Nishal Global AI (NGAI)</strong>, ZenoAI brings
          advanced AI models together with a clean design to help you think,
          create, and automate effortlessly.
        </p>
        <p>
          ZenoAI isn’t just a chatbot — it’s your global AI companion for
          innovation and productivity.
        </p>
      </div>

      <footer className="mt-12 text-xs text-gray-500">
        © {new Date().getFullYear()} NGAI — All rights reserved.
      </footer>
    </div>
  );
}
