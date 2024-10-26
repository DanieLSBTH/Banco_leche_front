import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { MeterGroup } from 'primereact/metergroup';
import api from '../../services/api';

export default function ResumenPorMesBarChart() {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [metricData, setMetricData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/donadora_detalle/resumen-por-mes/');
                const data = response.data;

                const formattedData = data.map(item => ({
                    mes: `${item.mes} - ${item.servicio_tipo}`,
                    totalDonaciones: parseInt(item.total_donaciones, 10),
                    totalDonadoras: parseInt(item.total_donadoras, 10),
                    totalLitros: parseFloat(item.total_litros)
                }));

                const totalDonaciones = formattedData.reduce((acc, item) => acc + item.totalDonaciones, 0);
                const totalDonadoras = formattedData.reduce((acc, item) => acc + item.totalDonadoras, 0);
                const totalLitros = formattedData.reduce((acc, item) => acc + item.totalLitros, 0);

                const documentStyle = getComputedStyle(document.documentElement);
                setChartData({
                    labels: formattedData.map(item => item.mes),
                    datasets: [
                        {
                            label: 'Donaciones',
                            backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                            borderColor: documentStyle.getPropertyValue('--blue-500'),
                            data: formattedData.map(item => item.totalDonaciones)
                        },
                        {
                            label: 'Donadoras',
                            backgroundColor: documentStyle.getPropertyValue('--green-500'),
                            borderColor: documentStyle.getPropertyValue('--green-500'),
                            data: formattedData.map(item => item.totalDonadoras)
                        },
                        {
                            label: 'Litros Distribuidos',
                            backgroundColor: documentStyle.getPropertyValue('--yellow-500'),
                            borderColor: documentStyle.getPropertyValue('--yellow-500'),
                            data: formattedData.map(item => item.totalLitros)
                        }
                    ]
                });

                setChartOptions({
                    indexAxis: 'y',
                    maintainAspectRatio: false,
                    aspectRatio: 0.8,
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
                                color: documentStyle.getPropertyValue('--text-color-secondary'),
                                font: {
                                    weight: 500
                                }
                            },
                            grid: {
                                display: false,
                                drawBorder: false
                            }
                        },
                        y: {
                            ticks: {
                                color: documentStyle.getPropertyValue('--text-color-secondary')
                            },
                            grid: {
                                color: documentStyle.getPropertyValue('--surface-border'),
                                drawBorder: false
                            }
                        }
                    }
                });

                setMetricData([
                    { label: 'Total Donaciones', color: '#8884d8', value: totalDonaciones, icon: 'pi pi-heart' },
                    { label: 'Total Donadoras', color: '#82ca9d', value: totalDonadoras, icon: 'pi pi-users' },
                    { label: 'Total Litros Distribuidos', color: '#ffc658', value: totalLitros, icon: 'pi pi-drop' }
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
