// Importaciones de Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";

import BarsCharts from "../Charts/BarsCharts";   // Asegúrate de que la ruta es correcta
import PiesChart from "../Charts/PiesChart";     // Asegúrate de que la ruta es correcta
import ResumenMensualSolicitudL from "../Charts/ResumenMensualSolicitudL"; // Asegúrate de que la ruta es correcta

function Grafica() {
    return (
        <div className="container">
            {/* Encabezado */}
            <h1 className="text-center font-monospace fw-bold lh-base my-4">
                Resumen de estadísticas del banco de leche humana
            </h1>

            {/* Gráfica de líneas */}
            <div className="mb-4">
                <p><b>Gráfica: </b>Resumen de estimulación de madres</p>
                <div className="bg-light mx-auto border border-2 border-primary" style={{ maxWidth: "100%", height: "250px" }}>
                    <BarsCharts />
                </div>
            </div>
            <hr className="mt-3 mb-2"/>

            {/* Gráfica de control de despacho */}
            <div className="mb-4">
                <p><b>Gráfica: </b>Resumen control de despacho</p>
                <div className="bg-light mx-auto border border-2 border-primary" style={{ maxWidth: "100%", height: "250px" }}>
                    <ResumenMensualSolicitudL />
                </div>
            </div>
            <hr className="mt-3 mb-2"/>

            {/* Gráfico circular */}
            <div className="mb-4">
                <p><b>Gráfica: </b>Resumen donadoras</p>
                <div className="bg-light mx-auto border border-2 border-primary" style={{ maxWidth: "100%", height: "250px" }}>
                    <PiesChart />
                </div>
            <hr className="mt-3 mb-2"/>
                
            </div>
        </div>
    );
}

export default Grafica;
