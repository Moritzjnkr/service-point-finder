import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());  // Enable CORS
app.use(express.json());

const exampleScanLocations = [
    {
        id: 1,
        locationType: "dropOffPoint",
        status: "active",
        description: "Mo 11-20\nDi 11-20\nMi 11-20\nDo 11-20\nFr 11-20\nSa 11-20\nSo -",
        address: {
            name: "Active drop off point",
            addressLine1: "Arcisstr. 32",
            addressLine2: "",
            postalCode: "80333",
            city: "Munich",
            country: "Germany"
        }
    },
    {
        id: 2,
        locationType: "dropOffPoint",
        status: "inactive",
        description: "Mo 11-20\nDi 11-20\nMi 11-20\nDo 11-20\nFr 11-20\nSa 11-20\nSo -",
        address: {
            name: "Inactive drop off point",
            addressLine1: "Arcisstr. 1",
            addressLine2: "",
            postalCode: "80333",
            city: "Munich",
            country: "Germany"
        },
    },
    {
        id: 3,
        locationType: "cleaningStation",
        status: "active",
        description: "",
        address: {
            name: "Active cleaning station",
            addressLine1: "Arcisstr. 10",
            addressLine2: "",
            postalCode: "80333",
            city: "Munich",
            country: "Germany"
        },
    }
];

app.get('/getDistanceMatrix', async (req, res) => {
  const { origins } = req.query;
  const destinations = exampleScanLocations
    .filter(loc => loc.locationType === "dropOffPoint")
    .map(loc => `${loc.address.addressLine1}, ${loc.address.postalCode} ${loc.address.city}, ${loc.address.country}`)
    .join('|');

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${encodeURIComponent(destinations)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error('Failed to fetch distance data');
    }
    
    const results = data.rows[0].elements;
    const locationsWithDistance = exampleScanLocations.map((loc, index) => {
      if (loc.locationType === "dropOffPoint") {
        return {
          ...loc,
          distance: results[index].distance.text,
          duration: results[index].duration.text
        };
      }
      return loc;
    });

    res.json(locationsWithDistance);
  } catch (error) {
    console.error('Error fetching Google Maps data:', error);
    res.status(500).json({ message: 'Failed to fetch distance data', error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
