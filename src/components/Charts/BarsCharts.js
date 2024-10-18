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
import api from '../../services/api'; // Importa tu archivo api.js

export default function BarsChart() {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        // Fetch data from the API using your api instance
        api.get('/estimulacion/resumen_estimulacion/')
            .then(response => {
                // Transform the data to fit Recharts structure
                const formattedData = response.data.map(item => ({
                    mes: item.mes,
                    totalEstimulaciones: parseInt(item.total_estimulaciones, 10),
                    totalConstantes: parseInt(item.total_constantes, 10),
                    totalNuevas: parseInt(item.total_nuevas, 10)
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
                <Bar dataKey="totalEstimulaciones" fill="#8884d8" />
                <Bar dataKey="totalConstantes" fill="#82ca9d" />
                <Bar dataKey="totalNuevas" fill="#ffc658" />
            </BarChart>
        </ResponsiveContainer>
    );
}
