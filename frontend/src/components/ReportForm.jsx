import React, { useState } from 'react';

const ReportForm = () => {
  const [formData, setFormData] = useState({
    lat: '',
    lng: '',
    description: '',
    userId: '',
    categoryId: ''
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const params = new URLSearchParams(formData).toString();
    try {
      const response = await fetch(`http://192.168.0.42:8080/api/reports?${params}`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        setStatus('Success: ' + JSON.stringify(result));
      } else {
        const error = await response.text();
        setStatus('Error: ' + error);
      }
    } catch (err) {
      setStatus('Network error: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded max-w-md mx-auto">
      <div>
        <label className="block">Latitude:</label>
        <input
          type="text"
          name="lat"
          value={formData.lat}
          onChange={handleChange}
          className="border p-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block">Longitude:</label>
        <input
          type="text"
          name="lng"
          value={formData.lng}
          onChange={handleChange}
          className="border p-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block">Description:</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="border p-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block">User ID:</label>
        <input
          type="text"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          className="border p-1 w-full"
          required
        />
      </div>
      <div>
        <label className="block">Category ID:</label>
        <input
          type="text"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          className="border p-1 w-full"
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit Report
      </button>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </form>
  );
};

export default ReportForm;
