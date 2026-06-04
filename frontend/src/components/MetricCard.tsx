import { motion } from "framer-motion";

interface MetricCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: {
        value: string | number;
        positive: boolean;
    };
}

function MetricCard({ title, value, description, icon, trend }: MetricCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, borderColor: "rgba(99, 102, 241, 0.4)" }}
            transition={{ duration: 0.3 }}
            className="bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between hover:shadow-indigo-500/5 transition-all duration-200"
        >
            <div>
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">
                    <span>{title}</span>
                    {icon && <span className="text-slate-400">{icon}</span>}
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-white font-display">{value}</p>
            </div>
            {(description || trend) && (
                <div className="flex items-center justify-between mt-4">
                    {description && <p className="text-xs text-slate-500">{description}</p>}
                    {trend && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                            trend.positive 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                            {trend.value}
                        </span>
                    )}
                </div>
            )}
        </motion.div>
    );
}

export default MetricCard;
