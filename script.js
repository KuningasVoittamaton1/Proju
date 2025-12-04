$(function () {
  const $lomake = $("#hakulomake");
  const $syote = $("#syote");
  const $virhe = $("#error");
  const $tulos = $("#tulos");
  const $logo = $("#logo");
  const $loader = $("#loader");
  const $apiCount = $("#api-count");
  const apiKey = "cOsLrAZjEpYNWphIA1bg8QFQxtEQJYt6";

  // Api hakujen määrän laskuri
  let apiCallCount = 0;
  const previousPrices = {}; // edellinen haettu hinta symbolille

  // Laskurin päivitys
  function updateApiCount() {
    apiCallCount += 1;
    $apiCount.text("API-kutsuja tällä sessiolla: " + apiCallCount);
  }

  // Haku
  $lomake.on("submit", function (e) {
    e.preventDefault();
    // tekstin käsittely (isot kirjaimet ja tyhjennys)
    const symboli = $syote.val().trim().toUpperCase();
    $virhe.text("");

    // virheilmoitus
    if (!symboli) {
      $virhe.text("Syötä ensin osakesymboli.");
      return;
    }

    // lataus merkki
    $loader.removeClass("piilossa");

    // Animaatioiden yms poisto
    $tulos.removeClass("piilossa").addClass("skeleton").removeClass("card-visible");
    $logo.empty();

    const profileUrl = `https://financialmodelingprep.com/stable/profile?symbol=${symboli}&apikey=${apiKey}`;

    updateApiCount();

    // axiosin kutsuminen
    axios
      .get(profileUrl)
      .then(function (response) {
        const data = response.data;

        // Virheilmoitus
        if (!Array.isArray(data) || data.length === 0) {
          $virhe.text("Osaketta ei löytynyt tai tiedot eivät ole saatavilla.");
          $tulos.addClass("piilossa").removeClass("skeleton");
          return;
        }

        const osake = data[0];

        // Logo
        if (osake.image) {
          $("<img>", {
            src: osake.image,
            alt: osake.companyName || symboli,
          }).appendTo($logo);
        }

        // Tiedot
        $("#nimi").text(osake.companyName || "—");
        $("#symboli").text(osake.symbol || "—");
        $("#sektori").text(osake.sector || "—");
        $("#porssi").text(osake.exchange || "—");
        $("#valuutta").text(osake.currency || "—");

        // Hinta ja muutos edelliseen hakuun
        const $hinta = $("#hinta");
        const $muutos = $("#hintamuutos");
        const rawPrice = osake.price != null ? parseFloat(osake.price) : null;

        let hintaTeksti = "—";
        if (rawPrice != null) {
          hintaTeksti =
            rawPrice.toFixed(2) + " " + (osake.currency ? osake.currency : "");
        }
        $hinta.text(hintaTeksti);

        // Poista vanhat luokat
        $hinta.removeClass("price-up price-down price-neutral");
        $muutos.text("");

        const prev = previousPrices[symboli];
        if (rawPrice != null) {
          if (prev != null) {
            const diff = rawPrice - prev;
            if (diff > 0.0001) {
              $hinta.addClass("price-up");
              $muutos.text("+" + diff.toFixed(2) + " verrattuna edelliseen hakuun");
            } else if (diff < -0.0001) {
              $hinta.addClass("price-down");
              $muutos.text(diff.toFixed(2) + " verrattuna edelliseen hakuun");
            } else {
              $hinta.addClass("price-neutral");
              $muutos.text("Sama hinta kuin edellisellä haulla");
            }
          } else {
            // ensimmäinen kerta tälle symbolille
            $hinta.addClass("price-neutral");
            $muutos.text("Ensimmäinen haku tälle symbolille");
          }

          // tallenna edellinen hinta muistiiin
          previousPrices[symboli] = rawPrice;
        } else {
          $hinta.addClass("price-neutral");
          $muutos.text("Hintaa ei saatu haettua.");
        }

        $("#vaihto").text(
          osake.volume != null ? osake.volume.toLocaleString("fi-FI") : "—"
        );
        $("#kuvaus").text(osake.description || "—");

        // Kortti ja animaatio
        $tulos
          .removeClass("skeleton piilossa")
          .each(function () {
            this.offsetHeight;
          })
          .addClass("card-visible");

        // Scrollaa kortin kohdalle
        $("html, body").animate(
          { scrollTop: $tulos.offset().top - 20 },
          500
        );
      })
        // virheilmoitus
      .catch(function (error) {
        console.error(error);
        let viesti = "Virhe tietojen haussa. Tarkista symboli ja API-avain.";
        if (error.response) {
          viesti += ` (status ${error.response.status})`;
        }
        $virhe.text(viesti);
        $tulos.addClass("piilossa").removeClass("skeleton");
      })
      .finally(function () {
        $loader.addClass("piilossa");
      });
  });

  // esimerkkisymbolien pikavalinta
  $(".quick-btn").on("click", function () {
    const symboli = $(this).data("symbol");
    if (!symboli) return;
    $syote.val(symboli);
    $lomake.trigger("submit");
  });
});

