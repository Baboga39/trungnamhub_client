export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar sau này thêm vào */}
      <main>{children}</main>
    </div>
  );
}
