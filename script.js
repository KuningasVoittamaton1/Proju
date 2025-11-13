document.getElementById("hakulomake").addEventListener("submit", function (e) {
  e.preventDefault(); // estää sivun uudelleenlatauksen

  const syote = document.getElementById("syote").value.toUpperCase();
  const virhe = document.getElementById("error");
  const tulos = document.getElementById("tulos");
  const logo = document.getElementById("logo");

  // virheviestin tyhjennys. 
  // Poistaa/piilottaa vanhan datan näkymisen uuden hakemisen ajaksi. 
  // tyhjentää logon paikan.
  virhe.textContent = "";
  tulos.classList.add("piilossa");
  logo.innerHTML = "";

  if (!syote) return;

  // luo uuden XMLHttpRequestin
  // oma api-avaimeni jota ei saisi jakaa mutta en keksinyt järkevämpää käyttötapaa saada apitietoja.
  const tieto = new XMLHttpRequest();
  const apiKey = "cOsLrAZjEpYNWphIA1bg8QFQxtEQJYt6";
  const url = `https://financialmodelingprep.com/stable/profile?symbol=${syote}&apikey=${apiKey}`;

  tieto.open("GET", url, true);

  // vastaus saapuu
  tieto.onreadystatechange = function () {
    if (tieto.readyState === 4) {
      if (tieto.status === 200) {
        const data = JSON.parse(tieto.responseText);

        // virhe ilmoitus
        if (!Array.isArray(data) || data.length === 0) {
          virhe.textContent = "Osaketta ei löytynyt tai tiedot eivät ole saatavilla.";
          return;
        }

        // Näytetään tulokset
        tulos.classList.remove("piilossa");
        const osake = data[0];

        // osakkeen logo
        const kuva = document.createElement("img");
        if (osake.image) {
          kuva.src = osake.image;
          kuva.alt = osake.companyName;
          logo.appendChild(kuva);
        }

        // Tiedot
        document.getElementById("nimi").textContent = osake.companyName || "—";
        document.getElementById("symboli").textContent = osake.symbol || "—";
        document.getElementById("sektori").textContent = osake.sector || "—";
        document.getElementById("porssi").textContent = osake.exchange || "—";
        document.getElementById("valuutta").textContent = osake.currency || "—";
        document.getElementById("hinta").textContent = (osake.price != null ? parseFloat(osake.price).toFixed(2) + " " + osake.currency : "—");
        document.getElementById("vaihto").textContent = osake.volume != null ? osake.volume : "—";
        document.getElementById("kuvaus").textContent = osake.description || "—";

        // siirtyy osaketieto boxin kohdalle jos käyttäjä jossain muualla (esim sivun ylhäällä tms)
        document.getElementById("tulos").scrollIntoView({ behavior: "smooth" });
        // antaa virheilmoituksen jos tulee ongelma esim tiedon haussa tai api-avaimen kanssa
      } else {
        virhe.textContent = "Virhe tietojen haussa (status " + tieto.status + "). Tarkista symboli ja API-avain.";
      }
    }
  };

  tieto.send();
});
