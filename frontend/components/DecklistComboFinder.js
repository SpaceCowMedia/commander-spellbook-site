export function DecklistComboFinder() {
  const doc = document;
  const put = (a, p) => a.forEach((e) => {
    p.appendChild(e)
  });
  const make = (element, array = []) => {
    const x = doc.createElement(element);
    array.forEach((o) => {
      x.classList.add(o)
    });
    return x;
  };

  const clearInput = doc.getElementById("clear-decklist-input");
  const decklistCardCount = doc.getElementById("decklist-card-count");
  const app = doc.getElementById("decklist-app");

  const comboSheetID = "1KqyDRZRCgy8YgMFnY0tHSw_3jC99Z0zFvJrPbfm66vA";
  const comboSheetPage = "combos";
  const dataBaseAPI = `https://opensheet.elk.sh/${comboSheetID}/${comboSheetPage}`;
  const scryfallSVGURL = "https://svgs.scryfall.io/card-symbols/";

  const getCombos = (decklist, headline) => {
    fetch(dataBaseAPI)
      .then((response) => response.json())
      .then((data) => {
        const combos = data;
        const availableCombos = [];
        const combosMissingCards = [];

        combos.forEach((combo) => {
          if (combo["Card 1"] !== undefined) {
            const requiredCards = [];
            let cardCount = 1;
            while (cardCount < 11) {
              requiredCards.push(combo[`Card ${cardCount}`]);
              ++cardCount;
            }

            combo.requiredCards = requiredCards.filter((x) => x);

            let requiredCardCount = combo.requiredCards.length;
            combo.requiredCards.forEach((card) => {
              if (decklist.includes(card.toLowerCase())) {
                --requiredCardCount;
              }
            });

            if (requiredCardCount === 0) {
              availableCombos.push(combo);
            } else if (requiredCardCount === 1) {
              combosMissingCards.push(combo);
            }
          }
        });

        availableCombos.forEach((combo) => createComboEntry(combo));

        let comboHeadlineText;
        switch (availableCombos.length) {
          case 0:
            comboHeadlineText = "No combos found";
            break;
          case 1:
            comboHeadlineText = "1 combo found:";
            break;
          default:
            comboHeadlineText = `${availableCombos.length} combos found:`;
        }

        headline.textContent = comboHeadlineText;

        if (combosMissingCards.length !== 0) {
          const headlineMissingCombos = make("h2", [
            "potential-combos-headline",
            "heading-subtitle",
          ]);
          const missingCombosDescription = make("p", [
            "potential-combos-description",
            "text-center",
          ]);
          const colorFilter = make("div", ["color-filter"]);
          const availableColors = ["W", "U", "B", "R", "G"];
          const availableColorCheckboxes = [];

          availableColors.forEach((color) => {
            const input = make("input");
            const label = make("label");
            const labelImage = make("img");

            labelImage.src = `${scryfallSVGURL}${color}.svg`;
            input.type = "checkbox";
            input.id = color + "id";
            input.checked = true;
            input.setAttribute("color", color);
            label.setAttribute("for", color + "id");
            labelImage.setAttribute("draggable", false);

            availableColorCheckboxes.push(input);

            put([labelImage], label);
            put([input, label], colorFilter);

            input.addEventListener("change", () => {
              let potentialComboEntriesLength = 0;
              const potentialComboEntries = doc.querySelectorAll(
                ".potential-combo-entry"
              );
              potentialComboEntries.forEach((entry) => {
                const entryColors = entry
                  .getAttribute("colors")
                  .toLocaleUpperCase()
                  .split(",");

                entry.style.display = "block";

                availableColorCheckboxes.forEach((checkbox) => {
                  if (checkbox.checked === false) {
                    if (entryColors.includes(checkbox.getAttribute("color"))) {
                      entry.style.display = "none";
                    }
                  }
                });
              });

              potentialComboEntries.forEach((entry) => {
                if (entry.style.display !== "none") {
                  ++potentialComboEntriesLength;
                }
              });

              headlineMissingCombos.textContent = `${potentialComboEntriesLength} potential combos`;
            });
          });

          headlineMissingCombos.textContent = `${combosMissingCards.length} potential combos`;
          missingCombosDescription.textContent =
            "List of combos where your decklist is missing 1 combo piece. Click the color symbols to filter for identity.";

          put(
            [headlineMissingCombos, missingCombosDescription, colorFilter],
            app
          );

          combosMissingCards.forEach((combo) =>
            createComboEntry(combo, decklist)
          );
        }
      });
  };

  let cardImagesCache = {};
  const CardImageCacheName =
    "commander-spellbook-combo-finder-card-images-database";
  const cardImagesCacheLocal = localStorage.getItem(CardImageCacheName);
  if (cardImagesCacheLocal !== null) {
    cardImagesCache = JSON.parse(cardImagesCacheLocal);
  }

  const scryfallCardByName = (name, imageWrapper, decklist) => {
    const image = make("img");
    put([image], imageWrapper);

    if (cardImagesCache[btoa(name)] !== undefined) {
      image.src = cardImagesCache[btoa(name)];
      if (decklist !== 0) {
        if (!decklist.includes(name.toLowerCase())) {
          image.classList.add("missing");
        }
      }
    } else {
      const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURI(
        name
      )}`;
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data.card_faces !== undefined) {
            cardImagesCache[btoa(name)] = data.card_faces[0].image_uris.normal;
          } else {
            image.src = data.image_uris.normal;
            cardImagesCache[btoa(name)] = data.image_uris.normal;
          }

          image.src = cardImagesCache[btoa(name)];
          localStorage.setItem(
            CardImageCacheName,
            JSON.stringify(cardImagesCache)
          );

          if (decklist !== 0) {
            if (!decklist.includes(name.toLowerCase())) {
              image.classList.add("missing");
            }
          }
        });
    }
  };

  const createComboEntry = (combo, decklist = 0) => {
    const details = make("details");
    const summary = make("summary");
    const summaryTitle = make("h3");
    const summaryImages = make("div", ["card-images"]);
    const comboDetails = make("div", ["combo-details"]);

    const innerEntries = ["Prerequisites", "Steps", "Results"];

    details.setAttribute("colors", combo["Color Identity"]);
    if (decklist !== 0) {
      details.classList.add("potential-combo-entry");
    }

    innerEntries.forEach((entry) => {
      let listType = "ul";
      if (entry === "Steps") {
        listType = "ol";
      }
      const headline = make("h4");
      const list = make(listType);
      headline.textContent = `${entry}:`;

      combo[entry]
        .trim()
        .split(".")
        .filter((x) => x)
        .forEach((line) => {
          const listEntry = make("li");

          const regexUppercase = /({[^}]*\})/gm;
          const newText = line.replaceAll(regexUppercase, (x) =>
            x.toUpperCase().replaceAll("/", "")
          );

          const regex = /{([^}]*)\}/gm;
          const substitution = `<span class="symbol"><img src="${scryfallSVGURL}$1.svg"></span>`;

          listEntry.innerHTML = newText.replace(regex, substitution);

          put([listEntry], list);
        });

      put([headline, list], comboDetails);
    });

    combo.requiredCards.forEach((card, index) => {
      if (index === 0) {
        summaryTitle.innerHTML = `${card}`;
      } else {
        summaryTitle.innerHTML = `${summaryTitle.innerHTML} | ${card}`;
      }

      scryfallCardByName(card, summaryImages, decklist);
    });

    put([summaryTitle, summaryImages], summary);
    put([summary, comboDetails], details);
    put([details], app);
  };

  const lastDeckListName = "commander-spellbook-combo-finder-last-decklist";

  const triggerTextareaInput = () => {
    clearInput.style.display = "flex";
    localStorage.setItem(lastDeckListName, JSON.stringify(decklistInput.value));
    app.innerHTML = "";
    const headline = make("h2", ["heading-subtitle"]);
    headline.textContent = "Loading combos...";
    put([headline], app);
    const regex = /^\d+ |^\d+x /gm;
    const regexNumbers = /^(\d+) .|^(\d+)x ./gm;
    const matchNumbers = decklistInput.value.match(regexNumbers) || [];
    const decklist = decklistInput.value
      .replace(regex, "")
      .split(/\n/)
      .filter((x) => x);
    const decklistSetRemoved = [];
    decklist.forEach((entry) => {
      decklistSetRemoved.push(entry.split(" (")[0].trim().toLowerCase());
    });

    let deckListCardCountNumber = 0;
    matchNumbers.forEach((match) => {
      deckListCardCountNumber += parseFloat(match);
    });

    deckListCardCountNumber += decklist.length - matchNumbers.length;

    if (deckListCardCountNumber === 1) {
      decklistCardCount.textContent = `${deckListCardCountNumber} card`;
    } else {
      decklistCardCount.textContent = `${deckListCardCountNumber} cards`;
    }

    decklistCardCount.style.display = "unset";

    getCombos(decklistSetRemoved, headline);
  };

  const lastDeckList = localStorage.getItem(lastDeckListName);
  if (lastDeckList !== null) {
    const value = JSON.parse(lastDeckList);
    decklistInput.value = value;
    if (value !== "") {
      triggerTextareaInput();
    }
  }

  clearInput.addEventListener("click", () => {
    decklistInput.value = "";
    localStorage.setItem(lastDeckListName, JSON.stringify(decklistInput.value));
    clearInput.style.display = "none";
    app.innerHTML = "";
    decklistCardCount.style.display = "none";
  });

  decklistInput.addEventListener("input", () => {
    triggerTextareaInput();
  });
}
