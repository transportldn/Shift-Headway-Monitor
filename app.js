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

function createStopRow(stop, side) {
  const row = document.createElement("div");
  row.className = `stop-row ${side}`;

  const name = document.createElement("span");
  name.className = "stop-name";

  if (isImportantStop(stop)) {
    name.classList.add("important");
  }

  name.textContent = stop.name;

  const marker = document.createElement("span");

  if (isImportantStop(stop)) {
    marker.className = "marker timing";
  } else {
    marker.className = "marker intermediate";
  }

  row.appendChild(name);
  row.appendChild(marker);

  return row;
}

function createDutySlot(duty) {
  const slot = document.createElement("div");
  slot.className = "duty-slot";

  if (duty) {
    const dutyDiv = document.createElement("div");
    dutyDiv.className = "duty";
    dutyDiv.textContent = duty.duty;
    slot.appendChild(dutyDiv);
  }

  return slot;
}

function renderDirection(direction, side) {
  const stopsColumn = document.getElementById(`${side}-stops`);
  const dutiesColumn = document.getElementById(`${side}-duties`);

  stopsColumn.innerHTML = "";
  dutiesColumn.innerHTML = "";

  direction.stops
    .filter(stop => stop.type !== "stand")
    .forEach(stop => {
      const dutyHere = duties.find(duty =>
        duty.destination === direction.destination &&
        duty.currentStop === stop.name
      );

      const stopRow = createStopRow(stop, side);
      stopsColumn.appendChild(stopRow);

      dutiesColumn.appendChild(createDutySlot(dutyHere));
    });
}

function setStandLabels() {
  const topDirection = routeData.directions[0];
  const bottomDirection = routeData.directions[1];

  const topStand = topDirection.stops.find(stop => stop.type === "stand");
  const bottomStand = bottomDirection.stops.find(stop => stop.type === "stand");

  document.getElementById("top-stand-label").textContent =
    topStand ? topStand.name : "Stand";

  document.getElementById("bottom-stand-label").textContent =
    bottomStand ? bottomStand.name : "Stand";
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

    const directionIndex = routeData.directions.indexOf(direction);

    if (directionIndex === 0) {
      topStandDuties.appendChild(dutyDiv);
    } else {
      bottomStandDuties.appendChild(dutyDiv);
    }
  });
}

function renderMonitor() {
  if (!routeData) return;

  renderDirection(routeData.directions[0], "left");
  renderDirection(routeData.directions[1], "right");

  setStandLabels();
  renderStands();
}

loadRoute();
