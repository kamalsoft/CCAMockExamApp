export function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <a
      href={to}
      className="inline-flex items-center gap-2 rounded px-2 py-1 text-sm text-gray-600 hover:text-blue-700 hover:bg-gray-100"
    >
      <span aria-hidden="true">←</span>
      {children}
    </a>
  )
}

export function BackToHome() {
  return <NavLink to="#home">Back to home</NavLink>
}