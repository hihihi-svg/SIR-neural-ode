import { useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import PredictionChart from "../components/PredictionChart";
import { motion } from "framer-motion";

function Forecast() {
    const [population, setPopulation] = useState(100000);
    const [infected, setInfected] = useState(100);
    const [vaccination, setVaccination] = useState(0.5);
    const [mobility, setMobility] = useState(0.8);
    const [days, setDays] = useState(90);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [metrics, setMetrics] = useState<any>(null);

    const handlePredict = async () => {
        setLoading(true);
        setStatusText("Solving Hybrid ODE equations on backend...");
        try {
            const response = await api.post("/predict/", {
                population,
                infected,
                vaccination,
                mobility,
                days
            });
            
            const trajectory = response.data.trajectory || [];
            setChartData(trajectory);
            setStatusText(`Forecast completed for ${response.data.forecast_days} days.`);
            
            // Calculate peak infection metrics from actual data
            if (trajectory.length > 0) {
                let maxInf = 0;
                let peakDay = 1;
                trajectory.forEach((d: any) => {
                    if (d.infected > maxInf) {
                        maxInf = d.infected;
                        peakDay = d.day;
                    }
                });
                
                const finalS = trajectory[trajectory.length - 1].susceptible;
                const finalAttackRate = (1.0 - finalS) * 100;
                
                setMetrics({
                    peakFraction: maxInf,
                    peakCases: Math.round(maxInf * population),
                    peakDay: peakDay,
                    attackRate: finalAttackRate
                });
            } else {
                setMetrics(null);
            }
        } catch (error) {
            console.error("API error:", error);
            setStatusText("Error connecting to backend SciML API.");
            setMetrics(null);
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
                        <span className="bg-violet-500/10 text-violet-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-violet-500/20">
                            NEURAL ODE SOLVER
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent font-display">
                        Outbreak Forecasting
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
                        Configure initial parameters to solve the Physics-Informed Hybrid Model (SIR + Neural Correction) dynamically.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Parameters Panel */}
                    <div className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
                        <h2 className="text-lg font-bold text-white mb-2 font-display">Model Inputs</h2>
                        
                        <div>
                            <div className="flex justify-between text-sm mb-1.5">
                                <label className="font-semibold text-slate-400">Total Population</label>
                                <span className="text-indigo-400 font-bold">{population.toLocaleString()}</span>
                            </div>
                            <input
                                type="number"
                                value={population}
                                onChange={(e) => setPopulation(Math.max(1000, Number(e.target.value)))}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-white transition-all text-sm outline-none"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1.5">
                                <label className="font-semibold text-slate-400">Initial Infected</label>
                                <span className="text-indigo-400 font-bold">{infected.toLocaleString()}</span>
                            </div>
                            <input
                                type="number"
                                value={infected}
                                onChange={(e) => setInfected(Math.max(1, Number(e.target.value)))}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-white transition-all text-sm outline-none"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="font-semibold text-slate-400">Vaccination Rate</label>
                                <span className="text-indigo-400 font-bold">{(vaccination * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={vaccination}
                                onChange={(e) => setVaccination(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <label className="font-semibold text-slate-400">Mobility Index</label>
                                <span className="text-indigo-400 font-bold">{(mobility * 100).toFixed(0)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={mobility}
                                onChange={(e) => setMobility(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-1.5">
                                <label className="font-semibold text-slate-400">Days to Forecast</label>
                                <span className="text-indigo-400 font-bold">{days} days</span>
                            </div>
                            <input
                                type="number"
                                min="10"
                                max="360"
                                value={days}
                                onChange={(e) => setDays(Math.max(10, Number(e.target.value)))}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl p-3 text-white transition-all text-sm outline-none"
                            />
                        </div>

                        <button
                            onClick={handlePredict}
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold p-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/10 active:scale-[0.98] outline-none"
                        >
                            {loading ? "Solving Equations..." : "Predict Outbreak"}
                        </button>
                        
                        {statusText && (
                            <p className="text-xs text-indigo-300 text-center font-medium">{statusText}</p>
                        )}
                    </div>

                    {/* Chart / Results Panel */}
                    <div className="lg:col-span-2 space-y-6">
                        {chartData.length > 0 ? (
                            <>
                                <PredictionChart data={chartData} />
                                
                                {metrics && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peak Outbreak Day</p>
                                            <p className="text-2xl font-bold mt-1 text-white font-display">Day {metrics.peakDay}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Highest point on simulated curve</p>
                                        </div>
                                        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Peak Active Infections</p>
                                            <p className="text-2xl font-bold mt-1 text-indigo-400 font-display">{metrics.peakCases.toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">{(metrics.peakFraction * 100).toFixed(2)}% of total population</p>
                                        </div>
                                        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl">
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attack Rate (Final Size)</p>
                                            <p className="text-2xl font-bold mt-1 text-emerald-400 font-display">{metrics.attackRate.toFixed(1)}%</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Cumulative fraction infected over run</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-[430px] border border-dashed border-slate-800 bg-slate-900/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 mb-4">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-semibold text-slate-300">No Forecast Rendered</h3>
                                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                                    Select parameters on the left panel and click "Predict Outbreak" to execute the continuous Hybrid ODE solver.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.main>
        </div>
    );
}

export default Forecast;
