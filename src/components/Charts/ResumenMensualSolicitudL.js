import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import { MeterGroup } from 'primereact/metergroup';
import api from '../../services/api';

const ResumenMensualSolicitudL = () => {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [metricData, setMetricData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/solicitud_de_leches/resumen/por-mes/');
                const data = response.data;

                const formattedData = data.asistencia.reduce((acc, curr) => {
                    const month = Object.keys(curr).find(key => key.includes('2024'));
                    if (month) {
                        const existing = acc.find(item => item.mes === month);
                        if (existing) {
                            existing[curr.tipo] = parseFloat(curr[month]);
                        } else {
                            acc.push({
                                mes: month,
                                [curr.tipo]: parseFloat(curr[month])
                            });
                        }
                    }
                    return acc;
                }, []);

                const totalBeneficiados = formattedData.reduce((acc, item) => acc + (item["recien nacidos beneficiados"] || 0), 0);
                const totalLecheLitros = formattedData.reduce((acc, item) => acc + (item["leche distribuida litros"] || 0), 0);

                const documentStyle = getComputedStyle(document.documentElement);
                setChartData({
                    labels: formattedData.map(item => item.mes),
                    datasets: [
                        {
                            label: 'Beneficiados',
                            backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                            borderColor: documentStyle.getPropertyValue('--blue-500'),
                            data: formattedData.map(item => item["recien nacidos beneficiados"] || 0)
                        },
                        {
                            label: 'Leche Distribuida (Litros)',
                            backgroundColor: documentStyle.getPropertyValue('--pink-500'),
                            borderColor: documentStyle.getPropertyValue('--pink-500'),
                            data: formattedData.map(item => item["leche distribuida litros"] || 0)
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
                    { label: 'Total Beneficiados', color: '#8884d8', value: totalBeneficiados, icon: 'pi pi-users' },
                    { label: 'Leche Distribuida (L)', color: '#82ca9d', value: totalLecheLitros, icon: 'pi pi-drop' }
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
};

export default ResumenMensualSolicitudL;
