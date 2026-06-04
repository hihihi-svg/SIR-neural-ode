import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PredictionChartProps {
    data: any[];
}

function PredictionChart({ data }: PredictionChartProps) {
    return (
        <div className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
            <h3 className="text-white text-lg font-semibold mb-4">Infection Trajectory</h3>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="day" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                            contentStyle={{ backgroundColor: "#1e293b", borderColor: "#475569", color: "#f8fafc" }} 
                            labelStyle={{ fontWeight: "bold" }}
                        />
                        <Legend />
                        <Line 
                            type="monotone" 
                            dataKey="cases" 
                            name="Predicted Infected" 
                            stroke="#6366f1" 
                            strokeWidth={3} 
                            activeDot={{ r: 8 }} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default PredictionChart;
