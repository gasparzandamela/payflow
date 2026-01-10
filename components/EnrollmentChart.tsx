import React from 'react';

export const EnrollmentChart: React.FC = () => {
    const data = [
        { label: 'Ago', value: 32 },
        { label: 'Set.', value: 36 },
        { label: 'Out.', value: 25 },
        { label: 'Nov.', value: 35 },
        { label: 'Dez.', value: 34 },
        { label: 'Jan.', value: 45 },
        { label: 'Fev.', value: 30 },
    ];

    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-full">
            <h3 className="font-bold text-slate-800 text-lg mb-6">Estatisticas de Matrículas</h3>
            
            <div className="flex items-end justify-between h-48 gap-2">
                <div className="flex flex-col justify-between h-full text-xs text-slate-400 mr-2">
                    <span>50</span>
                    <span>40</span>
                    <span>30</span>
                    <span>20</span>
                    <span>10</span>
                </div>
                
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className="w-full bg-slate-50 rounded-t-lg relative h-full flex items-end">
                            <div 
                                className="w-full bg-[#4DB6AC] rounded-t-md hover:bg-[#26A69A] transition-all duration-300 relative group-hover:shadow-lg"
                                style={{ height: `${(item.value / 50) * 100}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.value}
                                </div>
                            </div>
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                    </div>
                ))}
            </div>
            
            <div className="flex items-center gap-2 mt-6 justify-center">
                 <div className="w-3 h-3 bg-[#4DB6AC] rounded-sm"></div>
                 <span className="text-xs text-slate-600 font-medium">Novas Matrículas</span>
            </div>
        </div>
    );
};
