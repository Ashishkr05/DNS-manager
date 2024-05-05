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


const getHostedZoneId = async (domainName) => {
  const params = {
    DNSName: domainName,
    MaxItems: '1'
  };

  try {
    const data = await route53.listHostedZonesByName(params).promise();
    if (data.HostedZones && data.HostedZones.length > 0) {
      // Extract the hosted zone ID from the response
      return data.HostedZones[0].Id.replace('/hostedzone/', '');
    } else {
      throw new Error('Hosted zone not found for domain: ' + domainName);
    }
  } catch (error) {
    throw new Error('Error getting hosted zone ID: ' + error.message);
  }
};

// Create DNS record
app.post('/dns-records', async (req, res) => {
  const { subdomain, domain, type, value } = req.body;

  try {
    if (!subdomain || !domain) {
      throw new Error('Subdomain and domain are required');
    }

    const domainName = `${subdomain}.${domain}`;

    // Get the hosted zone ID based on the domain name
    const hostedZoneId = await getHostedZoneId(domain);
    
    // Proceed with creating the DNS record using the retrieved hosted zone ID
    const params = {
      HostedZoneId: hostedZoneId,
      ChangeBatch: {
        Changes: [
          {
            Action: 'CREATE',
            ResourceRecordSet: {
              Name: domainName,
              Type: type,
              TTL: 300,
              ResourceRecords: [{ Value: value }]
            }
          }
        ]
      }
    };

    const data = await route53.changeResourceRecordSets(params).promise();
    console.log('DNS record created:', data);
    res.status(201).json({ message: 'DNS record created successfully' });
  } catch (err) {
    console.error('Error creating DNS record:', err.message);
    res.status(500).json({ message: err.message });
  }
});

app.put('/dns-records/:recordId', async (req, res) => {
  const { recordId } = req.params;
  const { name, type, value } = req.body;

  const params = {
    HostedZoneId: HOSTED_ZONE_ID,
    ChangeBatch: {
      Changes: [
        {
          Action: 'UPSERT',
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
    console.log('DNS record updated:', data);
    res.status(200).json({ message: 'DNS record updated successfully' });
  } catch (err) {
    console.error('Error updating DNS record:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to get records from all hosted zones
app.get('/dns-records', async (req, res) => {
  try {
    const records = await getAllRecords();
    res.status(200).json(records);
  } catch (error) {
    console.error('Error retrieving DNS records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Function to get records from all hosted zones
const getAllRecords = async () => {
  try {
    const hostedZoneIds = await getHostedZoneIds();
    console.log("Hosted Zone IDs:", hostedZoneIds);

    const allRecords = await Promise.all(hostedZoneIds.map(async (zoneId) => {
      try {
        const records = await getRecordsFromHostedZone(zoneId);
        console.log(`Records from Hosted Zone ${zoneId}:`, records);
        return records;
      } catch (error) {
        console.error(`Error getting records from Hosted Zone ${zoneId}:`, error);
        return [];
      }
    }));

    return allRecords.flat();
  } catch (error) {
    throw new Error('Error getting records from all hosted zones: ' + error.message);
  }
};

// Function to get hosted zone IDs
const getHostedZoneIds = async () => {
  try {
    const data = await route53.listHostedZones({}).promise();
    return data.HostedZones.map(zone => zone.Id.replace('/hostedzone/', ''));
  } catch (error) {
    throw new Error('Error getting hosted zone IDs: ' + error.message);
  }
};

// Function to get records from a hosted zone
const getRecordsFromHostedZone = async (hostedZoneId) => {
  try {
    const data = await route53.listResourceRecordSets({ HostedZoneId: hostedZoneId }).promise();
    return data.ResourceRecordSets;
  } catch (error) {
    throw new Error('Error getting records from hosted zone: ' + error.message);
  }
};

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

app.post('/create-hosted-zone', async (req, res) => {
  const { domainName, description } = req.body;

  const params = {
    CallerReference: Date.now().toString(),
    Name: domainName,
    HostedZoneConfig: {
      Comment: description || 'Created via API'
    }
  };

  try {
    const data = await route53.createHostedZone(params).promise();
    console.log('Hosted zone created:', data);
    res.status(201).json({ message: 'Hosted zone created successfully' });
  } catch (err) {
    console.error('Error creating hosted zone:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
