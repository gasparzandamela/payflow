import React from 'react';

interface StatCardProps {
  icon: string;
  count: string | number;
  label: string;
  color: 'green' | 'blue' | 'yellow' | 'red';
}

const colorStyles = {
  green: {
    bg: 'bg-[#E8F5E9]',
    text: 'text-[#00984A]',
    iconBg: 'bg-[#C8E6C9]', 
  },
  blue: {
    bg: 'bg-[#E3F2FD]',
    text: 'text-[#137FEC]',
    iconBg: 'bg-[#BBDEFB]',
  },
  yellow: {
    bg: 'bg-[#FFF8E1]',
    text: 'text-[#F57F17]',
    iconBg: 'bg-[#FFECB3]',
  },
  red: {
    bg: 'bg-[#FFEBEE]',
    text: 'text-[#D32F2F]',
    iconBg: 'bg-[#FFCDD2]',
  }
};

export const DashboardStats: React.FC = () => {
    // These could be props or fetched data
    // For now, static as per design mockup, but can be dynamic
    const stats: StatCardProps[] = [
        { icon: 'people', count: '350', label: 'Estudantes Activos', color: 'green' },
        { icon: 'post_add', count: '12', label: 'Novas Matrículas', color: 'blue' },
        { icon: 'warning', count: '8', label: 'Matrículas Pendentes', color: 'yellow' },
        { icon: 'error_outline', count: '5', label: 'Documentos em falta', color: 'red' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
