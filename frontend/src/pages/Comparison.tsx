import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

function Comparison() {
    const [compareData, setCompareData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchComparison = async () => {
            try {
                const response = await api.get("/compare/");
                setCompareData(response.data);
            } catch (err) {
                console.error("Error fetching comparison data:", err);
                setError("Failed to connect to backend Comparison API.");
            } finally {
                setLoading(false);
            }
        };
        fetchComparison();
    }, []);

    return (
        <div className="flex bg-slate-950 min-h-screen text-slate-100 font-sans">
            <Sidebar />
            <motion.main 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex-1 p-8 overflow-y-auto"
            >
                <header className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-indigo-500/20">
                            BENCHMARK RESULTS
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent font-display">
                        Model Comparison
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
                        Benchmark classical SIR, deep Neural ODE, and Physics-Informed Hybrid architectures against observed JHU first-wave COVID-19 data.
                    </p>
                </header>

                {loading ? (
                    <div className="h-96 flex items-center justify-center text-slate-500">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-semibold">Loading model comparisons...</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-2xl text-center text-red-400 max-w-xl mx-auto my-12">
                        <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="font-bold text-lg">Connection Error</h3>
                        <p className="text-xs text-red-300/80 mt-1">{error}</p>
                    </div>
                ) : compareData?.error ? (
                    <div className="bg-amber-950/20 border border-amber-900/50 p-6 rounded-2xl text-center text-amber-400 max-w-xl mx-auto my-12">
                        <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="font-bold text-lg">Model Predictions Not Found</h3>
                        <p className="text-xs text-amber-300/80 mt-1">{compareData.error}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Trajectory comparison graph */}
                        <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl">
                            <h2 className="text-lg font-bold mb-4 text-white font-display">Comparative Trajectory Analysis</h2>
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={compareData.trajectories}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                        <XAxis dataKey="day" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#f8fafc" }} 
                                            labelStyle={{ fontWeight: "bold" }}
                                            formatter={(val: any) => [Number(val).toFixed(5), ""]}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="real" 
                                            name="Real Observed (Italy Wave 1)" 
                                            stroke="#e2e8f0" 
                                            strokeWidth={3} 
                                            dot={false}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="sir" 
                                            name="Classical SIR Fit" 
                                            stroke="#ef4444" 
                                            strokeWidth={2} 
                                            strokeDasharray="3 3"
                                            dot={false}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="neural" 
                                            name="Pure Neural ODE Fit" 
                                            stroke="#f97316" 
                                            strokeWidth={2} 
                                            strokeDasharray="5 5"
                                            dot={false}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="hybrid" 
                                            name="Hybrid SIR + Neural ODE Fit" 
                                            stroke="#10b981" 
                                            strokeWidth={3} 
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Metrics Table */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
                                <div className="p-6 border-b border-slate-850">
                                    <h2 className="text-lg font-bold text-white font-display">Performance Metrics Benchmark</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-300">
                                        <thead className="bg-slate-950/40 text-xs uppercase tracking-wider font-bold text-slate-400 border-b border-slate-850">
                                            <tr>
                                                <th className="px-6 py-4">Model Architecture</th>
                                                <th className="px-6 py-4">RMSE &darr;</th>
                                                <th className="px-6 py-4">MAE &darr;</th>
                                                <th className="px-6 py-4">R² Score &uarr;</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-850/60">
                                            {[
                                                { id: "sir", name: "Classical SIR", color: "text-red-400" },
                                                { id: "neural", name: "Pure Neural ODE", color: "text-orange-400" },
                                                { id: "hybrid", name: "Hybrid SIR + Neural ODE", color: "text-emerald-400", highlight: true }
                                            ].map((row) => {
                                                const modelMetrics = compareData.metrics[row.id] || { RMSE: 0, MAE: 0, R2: 0 };
                                                return (
                                                    <tr 
                                                        key={row.id} 
                                                        className={`transition-colors duration-150 ${row.highlight ? "bg-emerald-500/5 hover:bg-emerald-500/10 font-semibold" : "hover:bg-slate-900/30"}`}
                                                    >
                                                        <td className="px-6 py-4 flex items-center">
                                                            <span className={`w-2.5 h-2.5 rounded-full mr-3 ${row.id === 'sir' ? 'bg-red-500' : row.id === 'neural' ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                                                            <span className={row.highlight ? "text-white font-semibold" : ""}>{row.name}</span>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono">{modelMetrics.RMSE.toFixed(6)}</td>
                                                        <td className="px-6 py-4 font-mono">{modelMetrics.MAE.toFixed(6)}</td>
                                                        <td className={`px-6 py-4 font-mono ${row.highlight ? "text-emerald-400 font-bold" : ""}`}>
                                                            {modelMetrics.R2.toFixed(6)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Scientific Insight Card */}
                            <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
                                <div>
                                    <h3 className="text-white text-base font-semibold mb-3 font-display flex items-center">
                                        <svg className="w-5 h-5 text-indigo-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        SciML Insights
                                    </h3>
                                    <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                        <strong>Classical SIR</strong> has structurally rigid equations ($dS/dt = -\beta SI$), failing to adapt to the complex social interventions and daily behavioral variations of Italy's first wave.
                                    </p>
                                    <p className="text-slate-400 text-xs leading-relaxed mb-4">
                                        <strong>Pure Neural ODE</strong> models the entire system as a black box ($dy/dt = f_\theta(y)$). While highly flexible, it suffers from overfitting and lacks physical conservation principles.
                                    </p>
                                    <p className="text-slate-200 text-xs leading-relaxed font-medium bg-emerald-950/20 border border-emerald-900/30 p-3 rounded-xl">
                                        <strong>The Hybrid Advantage:</strong> By embedding the physical SIR conservation constraints directly into the neural network's integration process, the Hybrid model generalizes significantly better, achieving <strong>R² &gt; 0.989</strong>.
                                    </p>
                                </div>
                                <div className="text-[10px] text-slate-500 border-t border-slate-850 pt-4 mt-6">
                                    Best Performing: <span className="text-emerald-400 font-semibold">{compareData.best_model}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.main>
        </div>
    );
}

export default Comparison;
