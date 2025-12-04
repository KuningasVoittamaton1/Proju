$(function () {
  const $lomake = $("#hakulomake");
  const $syote = $("#syote");
  const $virhe = $("#error");
  const $tulos = $("#tulos");
  const $logo = $("#logo");
  const $loader = $("#loader");
  const $apiCount = $("#api-count");
  const apiKey = "cOsLrAZjEpYNWphIA1bg8QFQxtEQJYt6"; // API-avain

  // API-kutsujen määrä
  let apiCallCount = 0;

  function updateApiCount() {
    apiCallCount += 1;
    $apiCount.text("API-kutsuja tällä sessiolla: " + apiCallCount);
  }

  // -----------------------------
  // Lomakkeen käsittely
  // -----------------------------
  $lomake.on("submit", function (e) {
    e.preventDefault();

    const symboli = $syote.val().trim().toUpperCase();
    $virhe.text("");

    if (!symboli) {
      $virhe.text("Syötä ensin osakesymboli.");
      return;
    }

    // Näytä latausspinneri
    $loader.removeClass("piilossa");

    // Skeleton-tila kortille
    $tulos
      .removeClass("piilossa")
      .addClass("skeleton")
      .removeClass("card-visible");
    $logo.empty();

    const profileUrl = `https://financialmodelingprep.com/stable/profile?symbol=${symboli}&apikey=${apiKey}`;

    updateApiCount(); // nosta laskuria

    axios
      .get(profileUrl)
      .then(function (response) {
        const data = response.data;

        if (!Array.isArray(data) || data.length === 0) {
          $virhe.text("Osaketta ei löytynyt tai tiedot eivät ole saatavilla.");
          $tulos.addClass("piilossa").removeClass("skeleton");
          return;
        }

        const osake = data[0];

        // -----------------------------
        // LOGO
        // -----------------------------
        if (osake.image) {
          $("<img>", {
            src: osake.image,
            alt: osake.companyName || symboli,
          }).appendTo($logo);
        }

        // -----------------------------
        // Perustiedot
        // -----------------------------
        $("#nimi").text(osake.companyName || "—");
        $("#symboli").text(osake.symbol || "—");
        $("#sektori").text(osake.sector || "—");
        $("#porssi").text(osake.exchange || "—");
        $("#valuutta").text(osake.currency || "—");

        // -----------------------------
        // Hinta ja muutos
        // -----------------------------
        const $hinta = $("#hinta");
        const $muutos = $("#hintamuutos");

        const rawPrice =
          osake.price != null ? parseFloat(osake.price) : null;

        let hintaTeksti = "—";
        if (rawPrice != null) {
          hintaTeksti =
            rawPrice.toFixed(2) +
            " " +
            (osake.currency ? osake.currency : "");
        }
        $hinta.text(hintaTeksti);

        // Poista vanhat väriluokat
        $hinta.removeClass("price-up price-down price-neutral");
        $muutos.text("");

        // Haetaan edellinen hinta sessionStoragesta
        const prev = sessionStorage.getItem(symboli);
        const prevNum = prev != null ? parseFloat(prev) : null;

        if (rawPrice != null) {
          if (prevNum != null) {
            const diff = rawPrice - prevNum;

            if (diff > 0.0001) {
              $hinta.addClass("price-up");
              $muutos.text(
                "+" + diff.toFixed(2) + " verrattuna edelliseen hakuun"
              );
            } else if (diff < -0.0001) {
              $hinta.addClass("price-down");
              $muutos.text(
                diff.toFixed(2) + " verrattuna edelliseen hakuun"
              );
            } else {
              $hinta.addClass("price-neutral");
              $muutos.text("Sama hinta kuin edellisellä haulla");
            }
          } else {
            $hinta.addClass("price-neutral");
            $muutos.text("Ensimmäinen haku tälle symbolille");
          }

          // Tallenna uusi hinta sessionStorageen
          sessionStorage.setItem(symboli, rawPrice);
        } else {
          $hinta.addClass("price-neutral");
          $muutos.text("Hintaa ei saatu haettua.");
        }

        // -----------------------------
        // Vaihto ja kuvaus
        // -----------------------------
        $("#vaihto").text(
          osake.volume != null
            ? osake.volume.toLocaleString("fi-FI")
            : "—"
        );

        $("#kuvaus").text(osake.description || "—");

        // -----------------------------
        // Näytä kortti animaatiolla
        // -----------------------------
        $tulos
          .removeClass("skeleton piilossa")
          .each(function () {
            this.offsetHeight; // pakotettu reflow → animaatio toimii aina
          })
          .addClass("card-visible");

        // Scrollaa kortin kohdalle
        $("html, body").animate(
          { scrollTop: $tulos.offset().top - 20 },
          500
        );
      })
      .catch(function (error) {
        console.error(error);

        let viesti =
          "Virhe tietojen haussa. Tarkista symboli ja API-avain.";
        if (error.response) {
          viesti += ` (status ${error.response.status})`;
        }

        $virhe.text(viesti);
        $tulos.addClass("piilossa").removeClass("skeleton");
      })
      .finally(function () {
        // Piilota latausspinneri
        $loader.addClass("piilossa");
      });
  });

  // -----------------------------
  // Nopeat symbolipainikkeet
  // -----------------------------
  $(".quick-btn").on("click", function () {
    const symboli = $(this).data("symbol");
    if (!symboli) return;

    $syote.val(symboli);
    $lomake.trigger("submit");
  });
});
