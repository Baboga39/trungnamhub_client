export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur">
      <div className="px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 Hệ thống Quản lý Đoàn Sinh. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">
              Hỗ trợ
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Điều khoản
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Bảo mật
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
