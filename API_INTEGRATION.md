# API Integratie Documentatie

## Overzicht

De frontend is nu gekoppeld aan de backend API. De API draait op `http://localhost:3001`.

## Structuur

### 1. API Configuratie (`src/config/api.js`)
- Axios instance met base URL
- Request interceptor: voegt automatisch JWT token toe aan requests
- Response interceptor: handelt 401 errors af (logout bij expired token)

### 2. Services (`src/services/`)
- `auth.service.js` - Login en registratie
- `venues.service.js` - Venue CRUD operaties
- `friends.service.js` - Friend management

### 3. Composables (`src/composables/`)
- `useAuth.js` - Authentication state management
  - `login(email, password)` - Login gebruiker
  - `register(userData)` - Registreer nieuwe gebruiker
  - `logout()` - Logout gebruiker
  - `isAuthenticated` - Computed property voor auth status
  - `user` - Computed property voor huidige gebruiker

## Gebruik

### Login/Register
De Login en Register componenten zijn al gekoppeld aan de API. Ze gebruiken de `useAuth` composable.

### Voorbeeld: Venues ophalen

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { venuesService } from '@/services/venues.service.js'

const venues = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    venues.value = await venuesService.getAll({
      search: 'club',
      openStatus: 'open'
    })
  } catch (error) {
    console.error('Error fetching venues:', error)
  } finally {
    loading.value = false
  }
})
</script>
```

### Voorbeeld: Friends ophalen

```vue
<script setup>
import { ref, onMounted } from 'vue'
import { friendsService } from '@/services/friends.service.js'
import { useAuth } from '@/composables/useAuth.js'

const { isAuthenticated } = useAuth()
const friends = ref([])

onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      friends.value = await friendsService.getAll()
    } catch (error) {
      console.error('Error fetching friends:', error)
    }
  }
})
</script>
```

## Volgende Stappen

### 1. ClubList.vue koppelen
- Vervang placeholder data met `venuesService.getAll()`
- Implementeer filtering op basis van API response

### 2. Map.vue koppelen
- Haal venues op met filters
- Toon venues op de kaart (gebruik een kaart library zoals Leaflet of Google Maps)

### 3. Social.vue koppelen
- Vervang placeholder friends met `friendsService.getAll()`
- Implementeer friend requests met `friendsService.createRequest()`
- Implementeer friend removal met `friendsService.delete()`

### 4. Profile.vue koppelen
- Haal user data op na login
- Toon user info in ID card
- Implementeer venue creation voor venue owners

### 5. Chat.vue koppelen
- Implementeer chat messages ophalen
- Implementeer message sending

## API Endpoints Overzicht

### Auth
- `POST /auth/register` - Registreer nieuwe gebruiker
- `POST /auth/login` - Login gebruiker

### Venues
- `GET /venues` - Haal alle venues op (met optionele query params)
- `GET /venues/:id` - Haal venue op by ID
- `POST /venues` - Maak nieuw venue (auth + venue_owner role vereist)
- `PUT /venues/:id` - Update venue (auth + venue_owner role vereist)
- `DELETE /venues/:id` - Verwijder venue (auth + venue_owner role vereist)

### Friends
- `GET /friends` - Haal alle friends op (auth vereist)
- `GET /friends/pending` - Haal pending requests op (auth vereist)
- `GET /friends/:id` - Haal friend op by ID (auth vereist)
- `POST /friends` - Maak friend request (auth vereist)
- `PUT /friends/:id/accept` - Accepteer friend request (auth vereist)
- `PUT /friends/:id/block` - Blokkeer friend (auth vereist)
- `DELETE /friends/:id` - Verwijder friend (auth vereist)

## Authenticatie

JWT tokens worden automatisch opgeslagen in localStorage na login en automatisch toegevoegd aan alle API requests via de axios interceptor.

## Error Handling

Alle services gooien errors die je kunt opvangen met try/catch. De API configuratie handelt 401 errors automatisch af door de gebruiker uit te loggen.

## Testen

1. Start de API server: `cd APIWebFundamentalsProject && npm start`
2. Start de frontend: `npm run dev`
3. Test login/register via de Profile pagina
4. Test venues ophalen via ClubList of Map pagina

