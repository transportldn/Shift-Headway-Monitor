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
  // temporary test parser
  // later this will parse the real running board layout
  console.log(csvText);

  return [
    {
      duty: "TEST1",
      bus: "Bus 1",
      route: "50",
      currentStop: "Delta Point",
      destination: "Parchmore Road"
    }
  ];
}

function isImportantStop(stop) {
  return stop.type === "start" ||
         stop.type === "timing" ||
         stop.type === "terminus";
}

function renderDirection(direction, side, standBoxId) {
  const stopsColumn = document.getElementById(`${side}-stops`);
  const dutiesColumn = document.getElementById(`${side}-duties`);

  stopsColumn.innerHTML = "";
  dutiesColumn.innerHTML = "";

  direction.stops
    .filter(stop => stop.type !== "stand")
    .forEach(stop => {
      const stopDiv = document.createElement("div");
      stopDiv.className = "stop";

      if (isImportantStop(stop)) {
        stopDiv.classList.add("important");
      }

      stopDiv.textContent = stop.name;
      stopsColumn.appendChild(stopDiv);

      const dutySlot = document.createElement("div");
      dutySlot.className = "duty-slot";

      const dutyHere = duties.find(duty =>
        duty.destination === direction.destination &&
        duty.currentStop === stop.name
      );

      if (dutyHere) {
        const dutyDiv = document.createElement("div");
        dutyDiv.className = "duty";
        dutyDiv.textContent = duty.duty;
        dutySlot.appendChild(dutyDiv);
      }

      dutiesColumn.appendChild(dutySlot);
    });
}

function renderStands() {
  document.getElementById("top-stand-duties").innerHTML = "";
  document.getElementById("bottom-stand-duties").innerHTML = "";

  duties.forEach(duty => {
    const direction = routeData.directions.find(
      d => d.destination === duty.destination
    );

    if (!direction) return;

    const stand = direction.stops.find(s => s.type === "stand");

    if (stand && duty.currentStop === stand.name) {
      const div = document.createElement("div");
      div.className = "duty";
      div.textContent = `${duty.duty} - ${duty.bus}`;

      const boxId =
        routeData.directions.indexOf(direction) === 0
          ? "top-stand-duties"
          : "bottom-stand-duties";

      document.getElementById(boxId).appendChild(div);
    }
  });
}

function renderMonitor() {
  if (!routeData) return;

  renderDirection(routeData.directions[0], "left");
  renderDirection(routeData.directions[1], "right");
  renderStands();
}

loadRoute();
