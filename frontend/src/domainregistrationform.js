import React, { useState } from 'react';
import './domainregistrationform.css';
import axios from 'axios';

const DomainRegistrationForm = ({ onClose }) => {
  const [domainName, setDomainName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domainName) {
      setError('Please enter a domain name.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-hosted-zone`, {
        domainName,
        description
      });
      console.log(response.data);
      setDomainName('');
      setDescription('');
      setError('');
      setLoading(false);
      setSuccessMessage('Hosted zone created successfully');

      setTimeout(() => {
        setSuccessMessage('');
        onClose(); // Move the onClose inside setTimeout to ensure success message is displayed before closing
      }, 3000);
    } catch (error) {
      setError('Failed to create hosted zone.');
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="registration-form-container">
      <div className="close-button" onClick={onClose}>×</div>
      <h2>Register New Hosted Zone</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Domain Name: *
          <input
            type="text"
            value={domainName}
            onChange={(e) => setDomainName(e.target.value)}
            placeholder="example.com"
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional"
          />
        </label>
        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <button type="submit" disabled={loading}>Submit</button>
        {loading && <p>Loading...</p>}
      </form>
    </div>
  );
};

export default DomainRegistrationForm;