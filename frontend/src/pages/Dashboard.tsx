import Sidebar from "../components/Sidebar";
import MetricCard from "../components/MetricCard";
import { motion } from "framer-motion";

function Dashboard() {
    return (
        <div className="flex bg-slate-950 min-h-screen text-slate-100 font-sans">
            <Sidebar />
            <motion.main 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex-1 p-8 overflow-y-auto"
            >
                <header className="mb-10">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-indigo-500/20">
                            SURVEILLANCE LIVE
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent font-display">
                        Epidemic SciML Platform
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">
                        Integrating physics-informed neural network dynamics for pandemic surveillance. Combines classical compartment models with neural corrections to resolve model discrepancies.
                    </p>
                </header>
                
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <MetricCard 
                        title="Target Country"
                        value="Italy"
                        description="JHU First-Wave Historical Baseline (2020)"
                        icon={
                            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        }
                    />

                    <MetricCard 
                        title="Optimized Parameters"
                        value="β = 0.0622"
                        description="Learned from COVID time-series data (γ = 0.0)"
                        icon={
                            <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        }
                    />

                    <MetricCard 
                        title="Optimal Hybrid R²"
                        value="0.9898"
                        description="20x lower error compared to pure ML representations"
                        icon={
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Pipeline Status */}
                    <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-lg">
                        <h2 className="text-lg font-bold mb-6 text-white font-display flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2.5"></span>
                            Project Pipeline Status
                        </h2>
                        <ul className="space-y-4">
                            {[
                                { step: "Step 1", desc: "Dataset loader and clean JHU COVID time-series", status: "Done" },
                                { step: "Step 2 & 3", desc: "Classical SIR simulation and Nelder-Mead parameter fitting", status: "Done" },
                                { step: "Step 4", desc: "Continuous Neural ODE model integration (rk4/euler solver)", status: "Done" },
                                { step: "Step 5", desc: "Physics-Informed Hybrid ODE Model (SIR + Neural Correction)", status: "Done" },
                                { step: "Step 6", desc: "Comparative evaluation (RMSE, MAE, R² metrics)", status: "Done" },
                                { step: "Step 7", desc: "Explainability layer (uncertainty, dynamic parameters, sensitivity)", status: "Done" },
                                { step: "Step 8 & 9", desc: "FastAPI server connections and Interactive Dashboard UI", status: "Done" },
                            ].map((item, index) => (
                                <li key={index} className="flex items-start justify-between bg-slate-900/30 border border-slate-800/40 p-3.5 rounded-xl">
                                    <div className="flex items-start space-x-3">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50 mt-0.5">
                                            {item.step}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-slate-200">{item.desc}</p>
                                        </div>
                                    </div>
                                    <span className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                                        {item.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Scientific ML Explanation */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-bold mb-4 text-white font-display">Scientific Machine Learning</h2>
                            <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                Classical epidemiological models like <strong>SIR</strong> provide structural validity based on the conservation of mass, but suffer from strict parameters that fail to capture policy shifts, behavioral variables, or mutating variants.
                            </p>
                            <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                <strong>Neural ODEs</strong> parameterize the derivatives of a state using deep networks, enabling continuous representation of complex dynamics.
                            </p>
                            <div className="text-indigo-300 text-xs leading-relaxed font-semibold bg-indigo-950/40 border border-indigo-900/40 p-3 rounded-xl">
                                <strong>The Hybrid Architecture:</strong><br />
                                <span className="font-mono text-[10px] block mt-1 bg-slate-950/60 p-1.5 rounded text-slate-200">
                                    dI/dt = &beta;·S·I - &gamma;·I + f<sub>&theta;</sub>(S, I, R, t)
                                </span>
                                Here, classical SIR sets the baseline, while a neural network $f_\theta$ learns daily discrepancies, resolving unmodeled real-world phenomena.
                            </div>
                        </div>
                        <div className="border-t border-slate-850 pt-4 mt-6">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Architecture details</p>
                            <p className="text-xs text-slate-400">MLP Correction Net: 3 &rarr; 64 &rarr; 64 &rarr; 3</p>
                        </div>
                    </div>
                </div>
            </motion.main>
        </div>
    );
}
export default Dashboard;
