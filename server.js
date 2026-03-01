const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Zezwalamy na CORS (na wypadek, gdyby ktoś używał lokalnie)
app.use(cors());

// Serwowanie plików statycznych (naszej aplikacji SPA)
app.use(express.static(path.join(__dirname)));

// Nasz własny, wewnętrzny endpoint Proxy do GUNB RWDZ API
app.get('/api/gunb', async (req, res) => {
    const teryt = req.query.parcel_number;
    if (!teryt) {
        return res.status(400).json({ error: 'Brak parametru parcel_number' });
    }

    // Bezpośrednie zapytanie z serwera do GUNB (omijające ograniczenia CORS przeglądarki)
    const url = `https://wyszukiwarka.gunb.gov.pl/api/projects/?parcel_number=${encodeURIComponent(teryt)}`;
    
    try {
        const gunbResponse = await fetch(url, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 8000
        });

        if (!gunbResponse.ok) {
            return res.status(gunbResponse.status).json({ error: 'Błąd po stronie serwera GUNB' });
        }

        const data = await gunbResponse.json();
        res.json(data);
    } catch (error) {
        console.error('Błąd Proxy GUNB:', error.message);
        res.status(500).json({ error: 'Błąd połączenia z serwerem urzędu' });
    }
});

// Start serwera
app.listen(PORT, () => {
    console.log(`Serwer proxy i aplikacja MAG działają na porcie ${PORT}`);
});
