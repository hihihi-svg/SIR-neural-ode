import { Link, useLocation } from "react-router-dom";

function Sidebar() {
    const location = useLocation();
    
    const links = [
        { 
            name: "Dashboard", 
            path: "/", 
            icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        { 
            name: "Forecast", 
            path: "/forecast", 
            icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            )
        },
        { 
            name: "Simulation", 
            path: "/simulation", 
            icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            )
        },
        { 
            name: "Explainability", 
            path: "/explain", 
            icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        },
        { 
            name: "Comparison", 
            path: "/comparison", 
            icon: (
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
            )
        }
    ];

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white min-h-screen p-5 flex flex-col justify-between">
            <div>
                <div className="flex items-center space-x-2 mb-8 px-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7C4.547 9.547 4.5 10.768 4.5 12s.047 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.092-1.209.138-2.43.138-3.662z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent font-display">Epidemic SciML</h2>
                </div>
                <nav className="space-y-1">
                    {links.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive 
                                        ? "bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/10 font-semibold" 
                                        : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                                }`}
                            >
                                <span className={`transition-colors duration-200 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-100"}`}>
                                    {link.icon}
                                </span>
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="pt-4 border-t border-slate-800/80">
                <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-3 flex items-center space-x-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <div>
                        <p className="text-xs font-semibold text-slate-300">SciML Solver Active</p>
                        <p className="text-[10px] text-slate-500">Port 8001 connected</p>
                    </div>
                </div>
                <div className="text-[10px] text-slate-600 text-center mt-4">
                    v1.0.0 &copy; 2026
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
