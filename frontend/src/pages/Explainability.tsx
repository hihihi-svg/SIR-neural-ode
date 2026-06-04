import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

function Explainability() {
    const [explainData, setExplainData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchExplain = async () => {
            try {
                const response = await api.get("/explain/");
                setExplainData(response.data);
            } catch (err) {
                console.error("Error fetching explainability data:", err);
                setError("Failed to connect to backend Explainability API.");
            } finally {
                setLoading(false);
            }
        };
        fetchExplain();
    }, []);

    // Helper to get image URL
    const getImgUrl = (path: string) => {
        if (!path) return "";
        return `http://localhost:8001${path}`;
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
                        <span className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-1 rounded-full font-semibold border border-amber-500/20">
                            PHYSICS SHAP & UNCERTAINTY
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent font-display">
                        Explainability & Uncertainty
                    </h1>
                    <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
                        Analyze dynamic parameters, empirical prediction confidence bands, feature importance, and parameter sensitivity.
                    </p>
                </header>

                {loading ? (
                    <div className="h-96 flex items-center justify-center text-slate-500">
                        <div className="flex flex-col items-center space-y-3">
                            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-semibold">Loading explainability assets...</span>
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
                ) : (
                    <div className="space-y-10">
                        {/* Interactive Sensitivity Area Chart */}
                        {explainData?.sensitivity_data?.length > 0 && (
                            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 shadow-xl">
                                <h2 className="text-lg font-bold mb-1 text-white font-display">Interactive Sensitivity & Uncertainty Bands</h2>
                                <p className="text-slate-500 text-xs mb-6">Interactive view of outbreak size fluctuations under &plusmn;10% transmission rate (&beta;) variations.</p>
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={explainData.sensitivity_data}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis dataKey="day" stroke="#94a3b8" />
                                            <YAxis stroke="#94a3b8" />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#f8fafc" }} 
                                                labelStyle={{ fontWeight: "bold" }}
                                            />
                                            <Legend />
                                            <Area 
                                                type="monotone" 
                                                dataKey="higher_beta_infections" 
                                                name="High Beta (+10%)" 
                                                stroke="#f43f5e" 
                                                fill="#f43f5e" 
                                                fillOpacity={0.05} 
                                                dot={false}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="nominal_infections" 
                                                name="Nominal Beta" 
                                                stroke="#6366f1" 
                                                fill="#6366f1" 
                                                fillOpacity={0.1} 
                                                dot={false}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="lower_beta_infections" 
                                                name="Low Beta (-10%)" 
                                                stroke="#10b981" 
                                                fill="#10b981" 
                                                fillOpacity={0.05} 
                                                dot={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Generated Plots Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all duration-200">
                                <div>
                                    <h3 className="text-white text-base font-semibold mb-1 font-display">Neural Correction Terms</h3>
                                    <p className="text-slate-500 text-[10px] mb-4">Values computed by the MLP correction network ($f_\theta$) over time.</p>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-slate-850 bg-slate-950/40 p-2 flex items-center justify-center">
                                    <img 
                                        src={getImgUrl(explainData?.plots?.beta_plot)} 
                                        alt="Neural Corrections Over Time" 
                                        className="max-h-72 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all duration-200">
                                <div>
                                    <h3 className="text-white text-base font-semibold mb-1 font-display">Forecast Confidence Intervals</h3>
                                    <p className="text-slate-500 text-[10px] mb-4">Uncertainty bands evaluated via daily residuals tracking.</p>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-slate-850 bg-slate-950/40 p-2 flex items-center justify-center">
                                    <img 
                                        src={getImgUrl(explainData?.plots?.confidence_plot)} 
                                        alt="Uncertainty Quantification" 
                                        className="max-h-72 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all duration-200">
                                <div>
                                    <h3 className="text-white text-base font-semibold mb-1 font-display">Parameter Sensitivity Plots</h3>
                                    <p className="text-slate-500 text-[10px] mb-4">Simulated infectivity outcomes under varying transmission settings.</p>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-slate-850 bg-slate-950/40 p-2 flex items-center justify-center">
                                    <img 
                                        src={getImgUrl(explainData?.plots?.sensitivity_plot)} 
                                        alt="Sensitivity Analysis Curves" 
                                        className="max-h-72 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all duration-200">
                                <div>
                                    <h3 className="text-white text-base font-semibold mb-1 font-display">Intervention Feature Importance</h3>
                                    <p className="text-slate-500 text-[10px] mb-4">Relative weight contributions of policy inputs on outbreak size.</p>
                                </div>
                                <div className="rounded-xl overflow-hidden border border-slate-850 bg-slate-950/40 p-2 flex items-center justify-center">
                                    <img 
                                        src={getImgUrl(explainData?.plots?.feature_importance)} 
                                        alt="Feature Importance Weights" 
                                        className="max-h-72 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </motion.main>
        </div>
    );
}

export default Explainability;
