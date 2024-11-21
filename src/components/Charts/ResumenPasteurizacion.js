import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { MeterGroup } from 'primereact/metergroup';
import api from '../../services/api';

export default function ResumenPasteurizacion() {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [metricData, setMetricData] = useState([]);
    const translateMonth = (month) => {
        const months = {
            January: "Enero",
            February: "Febrero",
            March: "Marzo",
            April: "Abril",
            May: "Mayo",
            June: "Junio",
            July: "Julio",
            August: "Agosto",
            September: "Septiembre",
            October: "Octubre",
            November: "Noviembre",
            December: "Diciembre",
        };
        return months[month] || month; // Retorna el mes traducido o el original si no se encuentra
    };
    

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/trabajo_de_pasteurizaciones/getStats/');
                const data = response.data;
    
                const { promedio_kcal_l, total_acidez, total_registros, mes } = data;
    
                // Traduce el mes al idioma deseado
                const translatedMonth = translateMonth(mes.split(' ')[0]); // Obtiene solo el mes
                const year = mes.split(' ')[1]; // Obtiene el año
    
                // Configura los datos del gráfico y las métricas
                const documentStyle = getComputedStyle(document.documentElement);
                setChartData({
                    labels: ['Promedio kcal/L', 'Total Acidez', 'Total Registros'],
                    datasets: [
                        {
                            type: 'bar',
                            label: `Datos de ${translatedMonth} ${year}`,
                            backgroundColor: [
                                documentStyle.getPropertyValue('--blue-500'),
                                documentStyle.getPropertyValue('--green-500'),
                                documentStyle.getPropertyValue('--orange-500'),
                            ],
                            data: [promedio_kcal_l, total_acidez, total_registros],
                        },
                    ],
                });
    
                // Configura los datos para los indicadores
                setMetricData([
                    { label: 'Promedio kcal/L', color: '#8884d8', value: promedio_kcal_l, icon: 'pi pi-chart-line' },
                    { label: 'Total Acidez', color: '#82ca9d', value: total_acidez, icon: 'pi pi-percentage' },
                    { label: 'Total Registros', color: '#ffc658', value: total_registros, icon: 'pi pi-database' },
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, []);
    

    return (
        <div>
            <div className="card flex justify-content-center">
                <MeterGroup values={metricData} />
            </div>
            <div className="card" style={{ maxWidth: '600px', margin: 'auto' }}>
                <Chart type="bar" data={chartData} options={chartOptions} style={{ height: '400px' }} />
            </div>
        </div>
    );
}
