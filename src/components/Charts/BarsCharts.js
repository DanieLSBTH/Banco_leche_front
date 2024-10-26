import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { MeterGroup } from 'primereact/metergroup';
import api from '../../services/api';

export default function BarsChart() {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [metricData, setMetricData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/estimulacion/resumen_estimulacion/');
                const data = response.data;

                const formattedData = data.map(item => ({
                    mes: item.mes,
                    totalEstimulaciones: parseInt(item.total_estimulaciones, 10),
                    totalConstantes: parseInt(item.total_constantes, 10),
                    totalNuevas: parseInt(item.total_nuevas, 10)
                }));

                const totalEstimulaciones = formattedData.reduce((acc, item) => acc + item.totalEstimulaciones, 0);
                const totalConstantes = formattedData.reduce((acc, item) => acc + item.totalConstantes, 0);
                const totalNuevas = formattedData.reduce((acc, item) => acc + item.totalNuevas, 0);

                const documentStyle = getComputedStyle(document.documentElement);
                setChartData({
                    labels: formattedData.map(item => item.mes),
                    datasets: [
                        {
                            type: 'line',
                            label: 'Estimulaciones',
                            borderColor: documentStyle.getPropertyValue('--blue-500'),
                            borderWidth: 2,
                            fill: false,
                            tension: 0.4,
                            data: formattedData.map(item => item.totalEstimulaciones)
                        },
                        {
                            type: 'bar',
                            label: 'Constantes',
                            backgroundColor: documentStyle.getPropertyValue('--green-500'),
                            data: formattedData.map(item => item.totalConstantes),
                            borderColor: 'white',
                            borderWidth: 2
                        },
                        {
                            type: 'bar',
                            label: 'Nuevas',
                            backgroundColor: documentStyle.getPropertyValue('--orange-500'),
                            data: formattedData.map(item => item.totalNuevas)
                        }
                    ]
                });

                setChartOptions({
                    maintainAspectRatio: false,
                    aspectRatio: 0.6,
                    plugins: {
                        legend: {
                            labels: {
                                color: documentStyle.getPropertyValue('--text-color')
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: documentStyle.getPropertyValue('--text-color-secondary')
                            },
                            grid: {
                                color: documentStyle.getPropertyValue('--surface-border')
                            }
                        },
                        y: {
                            ticks: {
                                color: documentStyle.getPropertyValue('--text-color-secondary')
                            },
                            grid: {
                                color: documentStyle.getPropertyValue('--surface-border')
                            }
                        }
                    }
                });

                setMetricData([
                    { label: 'Total Estimulaciones', color: '#8884d8', value: totalEstimulaciones, icon: 'pi pi-chart-line' },
                    { label: 'Total Constantes', color: '#82ca9d', value: totalConstantes, icon: 'pi pi-refresh' },
                    { label: 'Total Nuevas', color: '#ffc658', value: totalNuevas, icon: 'pi pi-user-plus' }
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
                <Chart type="line" data={chartData} options={chartOptions} style={{ height: '400px' }} />
            </div>
        </div>
    );
}
