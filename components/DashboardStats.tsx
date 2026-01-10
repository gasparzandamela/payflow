import React from 'react';

interface DashboardStatsProps {
  activeStudents: number;
  newEnrollments: number;
}

const colorStyles = {
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
};

export const DashboardStats: React.FC<DashboardStatsProps> = ({ activeStudents, newEnrollments }) => {
    const stats = [
        { icon: 'people', count: activeStudents, label: 'Estudantes Activos', color: 'green' as const },
        { icon: 'post_add', count: newEnrollments, label: 'Novas Matrículas', color: 'blue' as const },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className={`rounded-xl p-6 flex items-center gap-4 ${colorStyles[stat.color].bg} border border-${stat.color}-100/50 shadow-sm`}>
                     <div className={`p-3 rounded-lg ${colorStyles[stat.color].text} bg-white/60`}>
                        <span className="material-icons-outlined text-3xl">{stat.icon}</span>
                     </div>
                     <div>
                         <div className={`text-2xl font-bold ${colorStyles[stat.color].text}`}>{stat.count}</div>
                         <div className="text-xs font-medium text-slate-600 uppercase tracking-wide leading-tight">{stat.label}</div>
                     </div>
                </div>
            ))}
        </div>
    );
};
