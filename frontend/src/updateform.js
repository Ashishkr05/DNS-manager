import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './updateform.css';

const UpdateFormModal = ({ recordToUpdate, onClose }) => {
  const [record, setRecord] = useState({
    subdomain: '',
    type: '',
    value: ''
  });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [placeholder, setPlaceholder] = useState('');

  useEffect(() => {
    if (recordToUpdate) {
      setRecord({
        subdomain: recordToUpdate.Name.split('.')[0],
        type: recordToUpdate.Type,
        value: recordToUpdate.ResourceRecords[0].Value
      });
    }
  }, [recordToUpdate]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setRecord(prevRecord => ({
      ...prevRecord,
      [name]: value
    }));
  };

  const handleTypeChange = e => {
    const selectedType = e.target.value;
    setRecord(prevRecord => ({
      ...prevRecord,
      type: selectedType,
      value: ''
    }));

    setPlaceholder(getPlaceholder(selectedType));
  };

  const getPlaceholder = type => {
    switch (type) {
      case 'A':
        return 'e.g., 192.0.2.1';
      case 'AAAA':
        return 'e.g., 2001:0db8::8a2e:0370:bab5';
      case 'CNAME':
        return 'e.g., www.example.com';
      case 'MX':
        return 'e.g., 10 mail.example.com';
      case 'NS':
        return 'e.g., ns1.example.com';
      case 'PTR':
        return 'e.g., www.example.com';
      case 'SOA':
        return 'e.g., ns1.example.com hostmaster.example.com 2024013101 7200 3600 1209600 3600';
      case 'SRV':
        return 'e.g., 1 10 3783 server.example.com';
      case 'TXT':
        return 'e.g., "sample text"';
      case 'DNSSEC':
        return 'e.g., 12345 3 1 1 123456789 abcdef67890123456789abcdef6789';
      default:
        return '';
    }
  };

  const handleFocus = () => {
    setPlaceholder('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (!record.subdomain) {
        setMessage('Error: Subdomain is required');
        setSuccess(false);
        return;
      }

      const filteredRecord = {
        name: `${record.subdomain}.dnsmanager.com`,
        type: record.type,
        value: record.value
      };

      const response = await axios.put(`http://localhost:5000/dns-records/${recordToUpdate.Name}`, filteredRecord);
      setMessage(response.data.message);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setMessage('Error: DNS record already exists');
      } else {
        setMessage('Error: Unable to update DNS record');
      }
      console.error('Error updating DNS record:', error);
      setSuccess(false);
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Update Record</h2>
        {success && <p className="success-message">{message}</p>}
        {!success && message && <p className="error-message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              name="subdomain"
              value={record.subdomain}
              onChange={handleInputChange}
              required
            />
            <span>&nbsp;&nbsp;.dnsmanager.com</span>
          </label>
          <label>
            Record Type:
            <select
              name="type"
              value={record.type}
              onChange={handleTypeChange}
              required
            >
              <option value="">Select Type</option>
              <option value="A">A (Address) Record</option>
              <option value="AAAA">AAAA (IPv6 Address) Record</option>
              <option value="CNAME">CNAME (Canonical Name) Record</option>
              <option value="MX">MX (Mail Exchange) Record</option>
              <option value="NS">NS (Name Server) Record</option>
              <option value="PTR">PTR (Pointer) Record</option>
              <option value="SOA">SOA (Start of Authority) Record</option>
              <option value="SRV">SRV (Service) Record</option>
              <option value="TXT">TXT (Text) Record</option>
              <option value="DNSSEC">DNSSEC</option>
            </select>
          </label>
          <label>
            Value:
            <input
              type="text"
              name="value"
              value={record.value}
              onChange={handleInputChange}
              onFocus={handleFocus}
              placeholder={placeholder}
              required
            />
          </label>
          <button type="submit">Update Record</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateFormModal;
