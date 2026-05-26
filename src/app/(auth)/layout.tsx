export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bar-black p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-serif tracking-[0.3em] gold-text-gradient">
            SASABar
          </h1>
          <div className="mt-2 w-24 mx-auto h-px gold-gradient" />
          <p className="text-bar-muted mt-3 text-xs tracking-[0.2em] uppercase">
            Members Club
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
