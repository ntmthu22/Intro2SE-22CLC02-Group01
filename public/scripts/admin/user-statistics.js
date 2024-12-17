const groupedLogs = JSON.parse(
  document.getElementById("groupedlogs-value").value
);

const loginData = JSON.parse(document.getElementById("login-data").value);
const loginLabels = JSON.parse(document.getElementById("login-labels").value);
const loginCtx = document.getElementById("myLoginChart").getContext("2d");

new Chart(loginCtx, {
  type: "line",
  data: {
    labels: loginLabels, // array of string
    datasets: [
      {
        label: "Login attempts", // string
        data: loginData, // array of number
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0,
      },
    ],
  },
  options: {
    animation: {
      duration: 1500,
      easing: "easeInOutQuart",
    },
    scales: {
      y: {
        ticks: {
          stepSize: 1,
        },
        beginAtZero: true,
      },
    },
  },
});

const PREV_MONTHS = 4;

const monthDict = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

const yearly = document.getElementById("yearly-statistics");
const monthly = document.getElementById("monthly-statistics");
const sortLinks = document.querySelectorAll(".sort-link");

const ctx = document.getElementById("myChart");
let chartInstance;

const now = new Date();

const monthlyDataLabels = [];
const monthlyData = [];

const yearlyDataLabels = [];
const yearlyData = [];

function initYearlyData() {
  let loopCount = 0;

  Object.keys(groupedLogs).forEach((year) => {
    if (loopCount >= 3) return;

    yearlyDataLabels.push(year);
    const total = Object.values(groupedLogs[year]).reduce(
      (sum, value) => sum + value,
      0
    );

    yearlyData.push(total);

    loopCount++;
  });
}

initYearlyData();

function initMonthlyData() {
  for (let i = PREV_MONTHS; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const label = monthDict[month];
    monthlyDataLabels.push(label);

    const logCount = groupedLogs[year]?.[month] || 0;
    monthlyData.push(logCount);
  }

  generateChart(monthlyDataLabels, "Monthly Generation Count", monthlyData);
}

initMonthlyData();

yearly.addEventListener("click", function () {
  yearly.classList.add("d-none");
  monthly.classList.remove("d-none");

  generateChart(yearlyDataLabels, "Yearly Generation Count", yearlyData);
});

monthly.addEventListener("click", function () {
  yearly.classList.remove("d-none");
  monthly.classList.add("d-none");

  generateChart(monthlyDataLabels, "Monthly Generation Count", monthlyData);
});

function generateChart(columnLabels, dataLabel, data) {
  if (chartInstance) {
    chartInstance.destroy(); // Destroy the existing chart
  }
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: columnLabels, // array of string
      datasets: [
        {
          label: dataLabel, // string
          data: data, // array of number
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
