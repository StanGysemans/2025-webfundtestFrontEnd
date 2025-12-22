<template>
  <main class="content">

    <!-- HERO -->
    <section class="section hero">
      <h1>UitgaansFinder</h1>
      <p>
        Jouw gids voor het ontdekken van de beste uitgaansgelegenheden.
        Alles wat je nodig hebt voor een geslaagde avond, op één plek.
      </p>
    </section>

    <!-- OVER ONS -->
    <section class="section">
      <h2>Over ons</h2>
      <p>
        UitgaansFinder is ontwikkeld om het vinden van leuke uitgaansplekken
        eenvoudiger en overzichtelijker te maken.
      </p>
      <p>
        Of je nu een club, bar of evenement zoekt — wij helpen je
        sneller de juiste keuze te maken.
      </p>
    </section>

    <!-- WAT DOEN WIJ -->
    <section class="section cards">
      <div class="card">
        <h3>Ontdekken</h3>
        <p>
          Vind nieuwe hotspots en populaire uitgaansgelegenheden
          in verschillende steden.
        </p>
      </div>

      <div class="card">
        <h3>Plannen</h3>
        <p>
          Plan je avond vooraf en voorkom keuzestress tijdens het uitgaan.
        </p>
      </div>

      <div class="card">
        <h3>Ervaren</h3>
        <p>
          Meer genieten, minder zoeken. Wij doen het werk voor je.
        </p>
      </div>
    </section>

    <!-- CONTACT -->
    <section class="section contact">
      <h2>Contact</h2>
      <p><strong>E-mail:</strong> contact@uitgaansfinder.nl</p>
      <p><strong>Instagram:</strong> @uitgaansfinder</p>
    </section>

  </main>
</template>

<style scoped>
.content {
  flex: 1;
  padding: 64px;
  color: #eaeaea;
  background-color: #0f0f0f;
  min-height: 100vh;
}

/* Sections */
.section {
  max-width: 900px;
  margin-bottom: 96px;
}

/* Hero */
.hero h1 {
  font-size: 56px;
  color: #9b5cff;
  margin-bottom: 16px;
}

.hero p {
  font-size: 20px;
  max-width: 700px;
  line-height: 1.6;
}

/* Titles */
h2 {
  font-size: 36px;
  color: #9b5cff;
  margin-bottom: 16px;
}

h3 {
  color: #9b5cff;
  margin-bottom: 8px;
}

/* Cards */
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.card {
  background: rgba(18, 18, 18, 0.85);
  padding: 24px;
  border-radius: 16px;
  border: 1px solid #1f1f1f;
  backdrop-filter: blur(6px);
}

/* Contact */
.contact p {
  font-size: 18px;
  margin-bottom: 12px;
}
</style>
