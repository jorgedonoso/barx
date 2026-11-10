import KeyMetrics from "@/features/dashboard/key-metrics/key-metrics";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <header className="mb-12">
          <div className="text-sm font-bold tracking-[0.2em] text-purple-600">
            BARX
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Your eCommerce performance at a glance
          </p>

          <KeyMetrics />
        </header>
      </div>
    </main>
  );
}
