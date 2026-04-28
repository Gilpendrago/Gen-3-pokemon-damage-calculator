const GEN3_TYPES = [
  "Normal","Fire","Water","Electric","Grass","Ice","Fighting","Poison",
  "Ground","Flying","Psychic","Bug","Rock","Ghost","Dragon","Dark","Steel"
];

const TYPE_CHART = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5, Steel: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Steel: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5 }
};

const form = document.getElementById("damage-form");
const moveTypeSelect = document.getElementById("move-type");
const defType1Select = document.getElementById("def-type-1");
const defType2Select = document.getElementById("def-type-2");
const resultBox = document.getElementById("result");

function fillOptions(select, includeNone = false) {
  if (includeNone) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "None";
    select.appendChild(opt);
  }

  GEN3_TYPES.forEach(type => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    select.appendChild(opt);
  });
}

function getMultiplier(move, t1, t2) {
  const m1 = TYPE_CHART[move]?.[t1] ?? 1;
  const m2 = t2 ? TYPE_CHART[move]?.[t2] ?? 1 : 1;
  return m1 * m2;
}

function calculateDamage(level, atk, def, power, mult) {
  const base = Math.floor(((2 * level / 5 + 2) * power * atk / def) / 50) + 2;
  return {
    min: Math.floor(base * mult * 0.85),
    max: Math.floor(base * mult)
  };
}

function getNum(id) {
  const val = Number(document.getElementById(id).value);
  return val > 0 ? val : null;
}

function formatEffectiveness(mult) {
  if (mult === 0) return "No effect (0x)";
  if (mult === 0.25) return "Not very effective (0.25x)";
  if (mult === 0.5) return "Not very effective (0.5x)";
  if (mult === 1) return "Neutral (1x)";
  if (mult === 2) return "Super effective (2x)";
  if (mult === 4) return "Super effective (4x)";
  return `${mult}x`;
}

fillOptions(moveTypeSelect);
fillOptions(defType1Select);
fillOptions(defType2Select, true);

moveTypeSelect.value = "Normal";
defType1Select.value = "Normal";

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const level = getNum("level");
  const atk = getNum("attack");
  const def = getNum("defense");
  const power = getNum("move-power");

  const hpVal = document.getElementById("hp").value;
  const hp = hpVal ? getNum("hp") : null;

  const move = moveTypeSelect.value;
  const t1 = defType1Select.value;
  const t2 = defType2Select.value;

  const stabChecked = document.getElementById("stab").checked;
  const stab = stabChecked ? 1.5 : 1;

  if (!level || !atk || !def || !power || !t1) {
    resultBox.innerHTML = `<h2>Result</h2><p>Invalid input</p>`;
    return;
  }

  const mult = getMultiplier(move, t1, t2);
  const { min, max } = calculateDamage(level, atk, def, power, mult * stab);

  const effectivenessText = formatEffectiveness(mult);

  let percentText = `<p class="muted">Add HP to see % damage</p>`;
  let hpBarHTML = "";

  if (hp) {
    const percentLeft = Math.max(0, ((hp - max) / hp) * 100);

    let color = "#22c55e";
    if (percentLeft < 50) color = "#facc15";
    if (percentLeft < 20) color = "#ef4444";

    hpBarHTML = `
      <div class="hp-container">
        <div class="hp-bar" id="hp-bar" style="width:100%; background:${color};"></div>
      </div>
      <p><strong>HP Left:</strong> ${percentLeft.toFixed(1)}%</p>
    `;

    percentText = `<p><strong>HP Damage:</strong> ${((min/hp)*100).toFixed(1)}% - ${((max/hp)*100).toFixed(1)}%</p>`;

    setTimeout(() => {
      const bar = document.getElementById("hp-bar");
      if (bar) {
        bar.style.width = percentLeft + "%";
      }
    }, 100);
  }

  let stabText = "";
  if (stab > 1) {
    stabText = `<p style="color:#22c55e;"><strong>STAB applied (1.5×)</strong></p>`;
  }

  resultBox.innerHTML = `
    <h2>Result</h2>
    <p><strong>Damage:</strong> ${min} - ${max}</p>
    ${percentText}
    ${hpBarHTML}
    <p><strong>Effectiveness:</strong> ${effectivenessText}</p>
    ${stabText}
  `;
});