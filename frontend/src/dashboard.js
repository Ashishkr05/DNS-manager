import React, { useState } from 'react';
import './dashboard.css';
import FormModal from './formmodal';
import RecordsTable from './recordstable';
import UploadJsonForm from './uploadjsonform';
import axios from 'axios';

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [records, setRecords] = useState([]);
  const [showRecordsTable, setShowRecordsTable] = useState(false);
  const [showUploadJsonForm, setShowUploadJsonForm] = useState(false); 

  const fetchRecords = async () => {
    try {
      const response = await axios.get('http://localhost:5000/dns-records');
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching DNS records:', error);
    }
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      await axios.delete(`http://localhost:5000/dns-records/${recordId}`);
      const updatedRecords = records.filter(record => record.id !== recordId);
      setRecords(updatedRecords);
      console.log('Record deleted successfully:', recordId);
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const toggleRecordsTable = async () => {
    if (!showRecordsTable) {
      await fetchRecords();
    }
    setShowRecordsTable(!showRecordsTable);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">DNS Manager</h1>
      <div className="button-container">
        <button onClick={() => setShowUploadJsonForm(true)}>Upload JSON File</button>
        <button className="add-record-button" onClick={() => setShowModal(true)}>Add Record</button>
        <button className="view-records-button" onClick={toggleRecordsTable}>View & Edit Records</button>
      </div>
      {showModal && <FormModal onClose={() => setShowModal(false)} />}
      {showRecordsTable && <RecordsTable records={records} onDeleteRecord={handleDeleteRecord} />}
      {showUploadJsonForm && <UploadJsonForm onClose={() => setShowUploadJsonForm(false)} />}
    </div>
  );
};

export default Dashboard;
