document.addEventListener('DOMContentLoaded', function () {
  const ctx = document.getElementById('thyroidPieChart').getContext('2d');
  const thyroidPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Hypothyroid', 'Hyperthyroid'],
      datasets: [{
        data: [15, 5], // You can dynamically pass data here
        backgroundColor: ['rgba(255, 193, 7, 0.7)', 'rgba(220, 53, 69, 0.7)'],
        borderColor: ['rgba(255, 193, 7, 1)', 'rgba(220, 53, 69, 1)'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#000' }
        }
      }
    }
  });
});
