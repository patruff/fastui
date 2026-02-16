// Default landing page template loaded on first login (costs 0 credits)
export const DEFAULT_LANDING_PAGE = `<div class="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 text-white" data-component-id="page-wrapper">

  <!-- Navigation -->
  <nav class="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto" data-component-id="navbar">
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">V</div>
      <span class="text-lg font-bold">VoiceUI</span>
    </div>
    <div class="hidden sm:flex items-center gap-6 text-sm text-gray-400">
      <a href="#features" class="hover:text-white transition">Features</a>
      <a href="#pricing" class="hover:text-white transition">Pricing</a>
      <a href="#faq" class="hover:text-white transition">FAQ</a>
    </div>
    <button class="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
      Get Started
    </button>
  </nav>

  <!-- Hero Section -->
  <section class="text-center px-6 pt-16 pb-20 max-w-4xl mx-auto" data-component-id="hero">
    <div class="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-medium mb-6">
      Now in Public Beta
    </div>
    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
      Build UIs with
      <span class="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"> your voice</span>
    </h1>
    <p class="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
      Speak what you want, watch it appear. AI-powered UI generation with real-time voice interaction. Download production-ready HTML instantly.
    </p>
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
      <button class="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl transition text-base">
        Start Building Free
      </button>
      <button class="w-full sm:w-auto border border-gray-700 hover:border-gray-500 text-gray-300 font-medium px-8 py-3 rounded-xl transition text-base">
        Watch Demo
      </button>
    </div>
    <p class="text-gray-500 text-sm mt-4">10 free generations. No credit card required.</p>
  </section>

  <!-- Features Grid -->
  <section id="features" class="px-6 py-16 max-w-5xl mx-auto" data-component-id="features">
    <h2 class="text-2xl font-bold text-center mb-12">How it works</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6" data-component-id="feature-1">
        <div class="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
        </div>
        <h3 class="font-semibold text-base mb-2">Speak It</h3>
        <p class="text-gray-400 text-sm leading-relaxed">Describe the UI you want in plain English. "Build a pricing page with three tiers."</p>
      </div>
      <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6" data-component-id="feature-2">
        <div class="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </div>
        <h3 class="font-semibold text-base mb-2">AI Builds It</h3>
        <p class="text-gray-400 text-sm leading-relaxed">Powered by OpenAI Codex. Production-quality HTML + Tailwind generated in seconds.</p>
      </div>
      <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6" data-component-id="feature-3">
        <div class="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4">
          <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </div>
        <h3 class="font-semibold text-base mb-2">Download It</h3>
        <p class="text-gray-400 text-sm leading-relaxed">One tap to download a standalone HTML file. Opens anywhere, no build step needed.</p>
      </div>
    </div>
  </section>

  <!-- Pricing Section -->
  <section id="pricing" class="px-6 py-16 max-w-5xl mx-auto" data-component-id="pricing">
    <h2 class="text-2xl font-bold text-center mb-3">Simple pricing</h2>
    <p class="text-gray-400 text-center mb-12 text-base">Start free, pay with USDC on Solana when you need more.</p>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <!-- Free Tier -->
      <div class="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 flex flex-col" data-component-id="plan-free">
        <h3 class="font-semibold text-base mb-1">Starter</h3>
        <p class="text-gray-500 text-sm mb-4">Try it out</p>
        <div class="mb-6">
          <span class="text-3xl font-bold">Free</span>
        </div>
        <ul class="space-y-3 text-sm text-gray-400 mb-8 flex-1">
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            10 UI generations
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Voice + tap interaction
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            HTML download
          </li>
        </ul>
        <button class="w-full border border-gray-600 hover:border-gray-400 text-gray-300 font-medium py-2.5 rounded-xl transition text-sm">
          Get Started
        </button>
      </div>

      <!-- Pro Tier -->
      <div class="bg-gray-800/80 border-2 border-indigo-500 rounded-2xl p-6 flex flex-col relative" data-component-id="plan-pro">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          Most Popular
        </div>
        <h3 class="font-semibold text-base mb-1">Pro</h3>
        <p class="text-gray-500 text-sm mb-4">For builders</p>
        <div class="mb-6">
          <span class="text-3xl font-bold">2</span>
          <span class="text-gray-400 text-base ml-1">USDC</span>
          <span class="text-gray-500 text-sm ml-1">/ 10 credits</span>
        </div>
        <ul class="space-y-3 text-sm text-gray-400 mb-8 flex-1">
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            10 credits per pack
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Buy as many packs as you want
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Pay with Phantom wallet
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Priority generation
          </li>
        </ul>
        <button class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl transition text-sm">
          Buy Credits
        </button>
      </div>

      <!-- Enterprise Tier -->
      <div class="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 flex flex-col" data-component-id="plan-enterprise">
        <h3 class="font-semibold text-base mb-1">Enterprise</h3>
        <p class="text-gray-500 text-sm mb-4">Custom solutions</p>
        <div class="mb-6">
          <span class="text-3xl font-bold">Custom</span>
        </div>
        <ul class="space-y-3 text-sm text-gray-400 mb-8 flex-1">
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Unlimited generations
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Custom model fine-tuning
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Self-hosted option
          </li>
          <li class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            Dedicated support
          </li>
        </ul>
        <button class="w-full border border-gray-600 hover:border-gray-400 text-gray-300 font-medium py-2.5 rounded-xl transition text-sm">
          Contact Us
        </button>
      </div>
    </div>
  </section>

  <!-- FAQ Section -->
  <section id="faq" class="px-6 py-16 max-w-3xl mx-auto" data-component-id="faq">
    <h2 class="text-2xl font-bold text-center mb-12">Frequently asked questions</h2>
    <div class="space-y-4">
      <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5" data-component-id="faq-1">
        <h3 class="font-semibold text-sm mb-2">How does voice UI building work?</h3>
        <p class="text-gray-400 text-sm leading-relaxed">Tap the mic, describe what you want in plain English, and our AI generates production-ready HTML with Tailwind CSS in seconds. You can also tap elements to select them and request specific changes.</p>
      </div>
      <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5" data-component-id="faq-2">
        <h3 class="font-semibold text-sm mb-2">Why USDC on Solana?</h3>
        <p class="text-gray-400 text-sm leading-relaxed">Fast, low-fee payments with no middlemen. Connect your Phantom wallet and pay in seconds. All transactions are verified on-chain.</p>
      </div>
      <div class="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5" data-component-id="faq-3">
        <h3 class="font-semibold text-sm mb-2">What can I build?</h3>
        <p class="text-gray-400 text-sm leading-relaxed">Landing pages, forms, dashboards, pricing tables, navigation bars, hero sections — anything you can describe. Each generation or modification uses one credit.</p>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-gray-800 px-6 py-8 mt-8" data-component-id="footer">
    <div class="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center font-bold text-xs">V</div>
        <span class="text-sm font-semibold">VoiceUI</span>
      </div>
      <p class="text-gray-500 text-xs">Powered by OpenAI Codex on Cerebras. Payments on Solana.</p>
      <div class="flex items-center gap-4 text-gray-500 text-xs">
        <a href="#" class="hover:text-gray-300 transition">Terms</a>
        <a href="#" class="hover:text-gray-300 transition">Privacy</a>
      </div>
    </div>
  </footer>

</div>`;
