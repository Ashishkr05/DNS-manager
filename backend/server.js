const express = require('express');
const app = express();
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const cors = require('cors');

dotenv.config();

const PORT = process.env.PORT || 5000;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const HOSTED_ZONE_ID = process.env.HOSTED_ZONE_ID;

const route53 = new AWS.Route53({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
});

// Middleware
app.use(express.json());
app.use(cors());


// Create DNS record
app.post('/dns-records', async (req, res) => {
  const { name, type, value } = req.body;

  const params = {
    HostedZoneId: HOSTED_ZONE_ID,
    ChangeBatch: {
      Changes: [
        {
          Action: 'CREATE',
          ResourceRecordSet: {
            Name: name,
            Type: type,
            TTL: 300,
            ResourceRecords: [{ Value: value }]
          }
        }
      ]
    }
  };

  try {
    const data = await route53.changeResourceRecordSets(params).promise();
    console.log('DNS record created:', data);
    res.status(201).json({ message: 'DNS record created successfully' });
  } catch (err) {
    console.error('Error creating DNS record:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Read DNS records
app.get('/dns-records', async (req, res) => {
  const params = {
    HostedZoneId: HOSTED_ZONE_ID
  };

  try {
    const data = await route53.listResourceRecordSets(params).promise();
    console.log('DNS records retrieved:', data);
    res.status(200).json(data.ResourceRecordSets);
  } catch (err) {
    console.error('Error retrieving DNS records:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Delete DNS record
app.delete('/dns-records/:recordName/:recordType/:recordValue', async (req, res) => {
  const { recordName, recordType, recordValue } = req.params;

  const params = {
    HostedZoneId: HOSTED_ZONE_ID,
    ChangeBatch: {
      Changes: [
        {
          Action: 'DELETE',
          ResourceRecordSet: {
            Name: recordName,
            Type: recordType,
            TTL: 300,
            ResourceRecords: [{ Value: recordValue }]
          }
        }
      ]
    }
  };

  try {
    const data = await route53.changeResourceRecordSets(params).promise();
    console.log('DNS record deleted:', data);
    res.status(200).json({ message: 'DNS record deleted successfully' });
  } catch (err) {
    console.error('Error deleting DNS record:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
