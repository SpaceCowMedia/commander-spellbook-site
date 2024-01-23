{
  function nameToId(name) {
    return name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9\-]/g, '');
  }

  const url = new URL(document.currentScript.src);
  const params = new URLSearchParams(url.searchParams);
  const uses = JSON.parse(params.get('uses'));
  const produces = JSON.parse(params.get('produces'));
  const id = params.get('id');
  const color = params.get('color');
  const extraRequirementCount = params.get('extraRequirementCount');
  const parent = document.currentScript.parentElement;

  parent.querySelector("#csbLoad").remove();

  parent.innerHTML = `
<link href="//cdn.jsdelivr.net/npm/mana-font@latest/css/mana.css" rel="stylesheet" type="text/css" />
<style>
  .outer {
    display: flex;
    border: 2px solid #282828;
    border-radius: 5px;
    font-family: Roboto, sans-serif;
    flex-direction: column;
    text-decoration: none;
    color: #212121 !important;
    font-size: 1.1rem !important;
    position: relative;
    background-color: #fafafa;
    width: 300px;
  }
  .list {
    display: flex;
    flex-direction: column;
    border-bottom: 2px solid #cecece;
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
  }
  .noborder {
    border-bottom: none;
  }
  .cardEntry {
    padding: 4px 0;
  }
  .otherPrereq {
    color: #8f8f8f;
  }
  .idContainer {
   background-color: #282828;
   height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    font-size: 1.75rem !important;
  }
  .logoContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #282828;
    color: #8f8f8f;
    gap: 5px;
    font-size: 0.75rem !important;
  }
  .cardHover {
    position: fixed;
    display: none;
    width: 240px;
    height: 334px;
    background-color: #35495e;
    background-size: cover;
    border-radius: 10px;
    z-index: 100;
  }
</style>
<a href="https://commanderspellbook.com/combo/${id}" rel="noopener noreferrer" target="_blank" class="outer">
  <div class="idContainer">
    ${color.split("").map((c) => `<i class="ms ms-${c.toLowerCase()} ms-cost ms-shadow"></i>`).join(' ')}
  </div>

  <div class="list">
    ${uses.map((cardName) => `
      <div id="${nameToId(cardName)}" class="cardEntry">
        ${cardName}
       </div>`).join('')}
    ${extraRequirementCount > 0 ? `
      <div class="cardEntry otherPrereq">
        +${extraRequirementCount} other prerequisite${extraRequirementCount > 1 ? 's' : ''}
        </div>` : ''}
  </div>
  <div class="list noborder">
    ${produces.map((feature) => `
      <div class="cardEntry">
        ${feature}
       </div>`).join('')}
  </div>
  <div class="logoContainer">
    <img src="https://commanderspellbook.com/images/gear.svg" height="30"  />
    <span>Commander Spellbook</span>
  </div>
</a>
<div id="card-hover" class="cardHover"></div>
`

  const hoverElement = parent.querySelector("#card-hover");
  if (!hoverElement) throw new Error("No hover element found");

  uses.forEach((cardName) => {
    const cardId = nameToId(cardName);
    const el = parent.querySelector(`#${cardId}`);
    if (!el) return;
    el.addEventListener('mousemove', (e) => {
      hoverElement.style.display = 'block';
      hoverElement.style.left = `${e.clientX + 25}px`;
      hoverElement.style.top = `${e.clientY + 25}px`;
      hoverElement.style.backgroundImage = `url("https://api.scryfall.com/cards/named?exact=${cardName}&format=image")`;
    });
    el.addEventListener('mouseout', () => {
      hoverElement.style.display = 'none';
    })
  });
}
