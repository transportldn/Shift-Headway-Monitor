let routeData = null;
let duties = [];

async function loadRoute() {
  const response = await fetch("data/routes/50.json");
  routeData = await response.json();
  renderMonitor();
}

document.getElementById("csvUpload").addEventListener("change", async event => {
  const file = event.target.files[0];
  if (!file) return;

  const text = await file.text();
  duties = parseRunningBoardCSV(text);

  document.getElementById("status").textContent =
    `Loaded ${duties.length} duties`;

  renderMonitor();
});

function parseRunningBoardCSV(csvText) {
  console.log(csvText);

  return [
    {
      duty: "DUTY 1",
      bus: "Bus 1",
      route: "50",
      currentStop: "Delta Point",
      destination: "Parchmore Road"
    },
    {
      duty: "DUTY 2",
      bus: "Bus 2",
      route: "50",
      currentStop: "Thornton Heath Clock Tower",
      destination: "Fairfield Halls"
    },
    {
      duty: "DUTY 3",
      bus: "Bus 3",
      route: "50",
      currentStop: "Parchmore Road Stand",
      destination: "Parchmore Road"
    }
  ];
}

function isImportantStop(stop) {
  return (
    stop.type === "start" ||
    stop.type === "timing" ||
    stop.type === "terminus"
  );
}

function createStopRow(stop, side, index, total) {
  const row = document.createElement("div");
  row.className = `stop-row ${side}`;

  if (index === 0) row.classList.add("first");
  if (index === total - 1) row.classList.add("last");

  const name = document.createElement("span");
  name.className = "stop-name";

  if (isImportantStop(stop)) {
    name.classList.add("important");
  }

  name.textContent = stop.name;

  const marker = document.createElement("span");
  marker.className = isImportantStop(stop)
    ? "marker timing"
    : "marker intermediate";

  row.appendChild(name);
  row.appendChild(marker);

  return row;
}

function createDutySlot(dutyList) {
  const slot = document.createElement("div");
  slot.className = "duty-slot";

  dutyList.forEach(duty => {
    const dutyDiv = document.createElement("div");
    dutyDiv.className = "duty";
    dutyDiv.textContent = duty.duty;
    slot.appendChild(dutyDiv);
  });

  return slot;
}

function getDutiesAtStop(direction, stop) {
  return duties.filter(duty =>
    duty.destination === direction.destination &&
    duty.currentStop === stop.name
  );
}

function renderDirection(direction, side, reverse = false) {
  const stopsColumn = document.getElementById(`${side}-stops`);
  const dutiesColumn = document.getElementById(`${side}-duties`);

  stopsColumn.innerHTML = "";
  dutiesColumn.innerHTML = "";

  let stops = direction.stops.filter(stop => stop.type !== "stand");

  if (reverse) {
    stops = [...stops].reverse();
  }

  stops.forEach((stop, index) => {
    const dutyList = getDutiesAtStop(direction, stop);

    stopsColumn.appendChild(
      createStopRow(stop, side, index, stops.length)
    );

    dutiesColumn.appendChild(createDutySlot(dutyList));
  });
}

function getStandByNamePart(namePart) {
  for (const direction of routeData.directions) {
    const stand = direction.stops.find(stop =>
      stop.type === "stand" &&
      stop.name.toLowerCase().includes(namePart.toLowerCase())
    );

    if (stand) return stand;
  }

  return null;
}

function setStandLabels() {
  const fairfieldStand = getStandByNamePart("Fairfield");
  const parchmoreStand = getStandByNamePart("Parchmore");

  document.getElementById("top-stand-label").textContent =
    fairfieldStand ? fairfieldStand.name : "Fairfield Stand";

  document.getElementById("bottom-stand-label").textContent =
    parchmoreStand ? parchmoreStand.name : "Parchmore Stand";
}

function renderStands() {
  const topStandDuties = document.getElementById("top-stand-duties");
  const bottomStandDuties = document.getElementById("bottom-stand-duties");

  topStandDuties.innerHTML = "";
  bottomStandDuties.innerHTML = "";

  duties.forEach(duty => {
    const direction = routeData.directions.find(
      d => d.destination === duty.destination
    );

    if (!direction) return;

    const stand = direction.stops.find(stop => stop.type === "stand");
    if (!stand) return;

    if (duty.currentStop !== stand.name) return;

    const dutyDiv = document.createElement("div");
    dutyDiv.className = "duty";
    dutyDiv.textContent = `${duty.duty} - ${duty.bus}`;

    if (stand.name.toLowerCase().includes("fairfield")) {
      topStandDuties.appendChild(dutyDiv);
    } else {
      bottomStandDuties.appendChild(dutyDiv);
    }
  });
}

function renderMonitor() {
  if (!routeData) return;

  renderDirection(routeData.directions[0], "left", false);
  renderDirection(routeData.directions[1], "right", true);

  setStandLabels();
  renderStands();
}

loadRoute();
