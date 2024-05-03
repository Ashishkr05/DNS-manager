import React, { useState } from 'react';
import axios from 'axios';
import './uploadjsonform.css';

const UploadJsonForm = ({ onClose }) => {
  const [fileInput, setFileInput] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event) => {
    setFileInput(event.target.files[0]);
  };

  const uploadJsonFile = async () => {
    if (!fileInput) {
      setErrorMessage('Please select a file');
      return;
    }
  
    const fileReader = new FileReader();
    fileReader.onload = async (event) => {
      try {
        const jsonContent = JSON.parse(event.target.result);
        const { name, type, value } = jsonContent;
  
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/dns-records`, {
          name,
          type,
          value
        });
        console.log('DNS record created:', response.data);
        setSuccessMessage('DNS record created successfully');
        setTimeout(() => {
          onClose();
        }, 2000);
      } catch (error) {
        console.error('Error uploading DNS record:', error);
        setErrorMessage('Error uploading DNS record');
      }
    };

    fileReader.readAsText(fileInput);
  };

  return (
    <div className="upload-json-form-container">
      <div className="upload-json-form">
        <h2>Upload JSON File</h2>
        <input type="file" onChange={handleFileChange} />
        <div className="button-container">
          <button onClick={uploadJsonFile}>Upload</button>
          <button onClick={onClose}>Cancel</button>
        </div>
        {successMessage && <p className="success-message" style={{ position: 'absolute', top: '10px', left: '10px', zIndex: '9999', backgroundColor: '#90EE90', color: 'white' }}>{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default UploadJsonForm;
