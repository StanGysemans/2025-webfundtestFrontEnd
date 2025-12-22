# Servers Starten

## Optie 1: Beide servers in één terminal (Aanbevolen)

Gebruik het nieuwe script om beide servers tegelijk te starten:

```bash
npm run dev:all
```

Dit start:
- Frontend (Vite) op `http://localhost:5173` (of een andere poort)
- API server op `http://localhost:3001`

## Optie 2: Twee aparte terminals

### Terminal 1 - Frontend:
```bash
cd "C:\Users\stang\OneDrive\Bureaublad\WebFundamentalsUitgaansfinder"
npm run dev
```

### Terminal 2 - API:
```bash
cd "C:\Users\stang\OneDrive\Bureaublad\APIWebFundamentalsProject"
npm start
```

## Controleer of alles werkt

1. **Frontend**: Open `http://localhost:5173` in je browser
2. **API**: Test met Postman of browser: `http://localhost:3001/venues`

## Troubleshooting

- **Poort al in gebruik**: Zorg dat poort 3001 en 5173 niet al gebruikt worden
- **API start niet**: Controleer of de database verbinding werkt in de API folder
- **CORS errors**: De API heeft al CORS geconfigureerd, maar controleer of de API daadwerkelijk draait

