import React, { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import api from '../../services/api'; // Asegúrate de que la ruta es correcta

export default function ResumenPorMesBarChart() {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // Fetch data from the API using your api instance
        api.get('/donadora_detalle/resumen-por-mes/')
            .then(response => {
                const data = response.data; // No necesitas usar .json()

                // Transform the data to fit Recharts structure
                const formattedData = data.map(item => ({
                    mes: item.mes + ' - ' + item.servicio_tipo,  // Combine month and service type
                    totalDonaciones: parseInt(item.total_donaciones, 10),
                    totalDonadoras: parseInt(item.total_donadoras, 10),
                    totalLitros: parseFloat(item.total_litros)  // Parse float for decimal values
                }));

                setChartData(formattedData);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalDonaciones" fill="#8884d8" />
                <Bar dataKey="totalDonadoras" fill="#82ca9d" />
                <Bar dataKey="totalLitros" fill="#ffc658" />
            </BarChart>
        </ResponsiveContainer>
    );
}
