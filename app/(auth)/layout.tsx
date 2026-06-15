export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-n-50 flex items-center justify-center p-4">
      {children}
    </main>
  );
}
