import Sidebar from "@/components/Sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="layout-wrapper">
            <Sidebar />
            <main className="main-content">
                <div className="page-container">
                    {children}
                </div>
            </main>
        </div>
    )
}
