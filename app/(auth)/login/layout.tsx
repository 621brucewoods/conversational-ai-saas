export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      <main className="flex-grow">{children}</main>
    </div>
  );
}
