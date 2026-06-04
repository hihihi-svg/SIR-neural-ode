import { useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

function Simulation() {
    const [mobility, setMobility] = useState(0.8);
    const [vaccination, setVaccination] = useState(0.3);
    const [lockdownIntensity, setLockdownIntensity] = useState(0.5);
    const [lockdownDay, setLockdownDay] = useState(40);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [summaryMetrics, setSummaryMetrics] = useState<any>(null);

    const handleSimulate = async () => {
        setLoading(true);
        setStatusText("Running dynamic multi-scenario simulation...");
        try {
            const response = await api.post("/simulate/", {
                mobility,
                vaccination,
                lockdown_intensity: lockdownIntensity,
                lockdown_day: lockdownDay
            });
            
            const trajectories = response.data.trajectories || [];
            setChartData(trajectories);
            setStatusText("Simulations completed successfully.");
            
            // Calculate comparison summary metrics
            if (trajectories.length > 0) {
                let maxBase = 0;
                let maxInt = 0;
                let maxWorst = 0;
                
                trajectories.forEach((d: any) => {
                    if (d.baseline > maxBase) maxBase = d.baseline;
                    if (d.intervention > maxInt) maxInt = d.intervention;
                    if (d.worst_case > maxWorst) maxWorst = d.worst_case;
                });
                
                const avertedCasesFraction = maxWorst - maxInt;
                
                setSummaryMetrics({
                    peakBaseline: maxBase,
                    peakIntervention: maxInt,
                    peakWorst: maxWorst,
                    avertedPercentage: Math.max(0, avertedCasesFraction * 100)
                });
            } else {
                setSummaryMetrics(null);
            }
        } catch (error) {
            console.error("Simulation error:", error);
            setStatusText("Error connecting to backend Simulation API.");
            setSummaryMetrics(null);
        } finally {
            setLoading(false);
        }
    };

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
                        <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20">
                            SCENARIO INTERVENTIONS
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent font-display">
                        Policy Simulation
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
                        Compare active lockdown and immunization mandates. Benchmark your policy against historical baselines and uncontrolled worst-case trajectories.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls Panel */}
                    <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
                        <h2 className="text-lg font-bold text-white mb-2 font-display">Intervention Sliders</h2>
                        
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="font-semibold text-slate-400">Mobility Index (Pre-Lockdown)</label>
                                <span className="text-indigo-400 font-bold">{(mobility * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0.2"
                                max="1.0"
                                step="0.05"
                                value={mobility}
                                onChange={(e) => setMobility(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Normal community movement baseline.</p>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="font-semibold text-slate-400">Vaccination Rate (Daily Rate)</label>
                                <span className="text-indigo-400 font-bold">{(vaccination * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={vaccination}
                                onChange={(e) => setVaccination(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Scales the daily susceptible-to-recovered transfer rate.</p>
                        </div>

                        <div className="border-t border-slate-800/80 pt-4">
                            <div className="flex justify-between text-sm mb-1">
                                <label className="font-semibold text-slate-400">Lockdown Intensity</label>
                                <span className="text-pink-400 font-bold">{(lockdownIntensity * 100).toFixed(0)}% reduction</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="0.9"
                                step="0.05"
                                value={lockdownIntensity}
                                onChange={(e) => setLockdownIntensity(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Reduces mobility when lockdown activates.</p>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="font-semibold text-slate-400">Lockdown Activation Day</label>
                                <span className="text-pink-400 font-bold">Day {lockdownDay}</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="120"
                                step="1"
                                value={lockdownDay}
                                onChange={(e) => setLockdownDay(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Day on which the lockdown measures trigger.</p>
                        </div>

                        <button
                            onClick={handleSimulate}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold p-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/10 active:scale-[0.98] outline-none"
                        >
                            {loading ? "Simulating Policy..." : "Run Policy Intervention"}
                        </button>
                        
                        {statusText && (
                            <p className="text-xs text-emerald-300 text-center font-medium">{statusText}</p>
                        )}
                    </div>

                    {/* Chart / Results Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        {chartData.length > 0 ? (
                            <>
                                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 shadow-lg">
                                    <h3 className="text-white text-lg font-semibold mb-4">Intervention Scenario Comparison</h3>
                                    <div className="h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                                <XAxis dataKey="day" stroke="#94a3b8" />
                                                <YAxis stroke="#94a3b8" label={{ value: "Infected Population Fraction", angle: -90, position: "insideLeft", fill: "#94a3b8", offset: 10 }} />
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#f8fafc" }} 
                                                    labelStyle={{ fontWeight: "bold" }}
                                                    formatter={(val: any) => [`${(Number(val) * 100).toFixed(2)}%`, ""]}
                                                />
                                                <Legend />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="worst_case" 
                                                    name="No Intervention (Worst Case)" 
                                                    stroke="#f43f5e" 
                                                    strokeWidth={2.5} 
                                                    dot={false}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="baseline" 
                                                    name="Standard Policy (Baseline)" 
                                                    stroke="#6366f1" 
                                                    strokeWidth={2} 
                                                    strokeDasharray="4 4"
                                                    dot={false}
                                                />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="intervention" 
                                                    name="Custom Policy (Intervention)" 
                                                    stroke="#10b981" 
                                                    strokeWidth={3} 
                                                    dot={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                
                                {summaryMetrics && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Infection Peak Under Custom Policy</p>
                                            <p className="text-3xl font-extrabold mt-1 text-emerald-400 font-display">{(summaryMetrics.peakIntervention * 100).toFixed(2)}%</p>
                                            <p className="text-xs text-slate-500 mt-1">Compared to {(summaryMetrics.peakWorst * 100).toFixed(2)}% under worst-case scenario</p>
                                        </div>
                                        <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Community Infections Averted</p>
                                                <p className="text-3xl font-extrabold mt-1 text-indigo-400 font-display">{summaryMetrics.avertedPercentage.toFixed(1)}%</p>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2">Maximum peak reduction achieved by selected policies</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-[460px] border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 mb-4">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-slate-300">No Simulation Rendered</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                                    Adjust interventional sliders on the left panel and click "Run Policy Intervention" to run parallel continuous solver scenarios.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.main>
        </div>
    );
}

export default Simulation;
