// src/components/ReportList.jsx
import React, { useEffect, useState } from "react";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://192.168.0.42:8080/api/reports")
      .then((response) => {
        if (!response.ok) throw new Error("Nätverksfel");
        return response.json();
      })
      .then((data) => {
        setReports(data);
      })
      .catch((error) => {
        console.error("Fel vid hämtning:", error);
        setError(error.message);
      });
  }, []);

  if (error) return <p>Något gick fel: {error}</p>;
  if (reports.length === 0) return <p>Inga rapporter än.</p>;

  return (
    <div>
      <h2>Rapporter</h2>
      <ul>
        {reports.map((report) => (
          <li key={report.id}>
            {report.description} – {report.lat}, {report.lng}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportList;

