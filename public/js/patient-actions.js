document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', () => {
      const patientId = button.dataset.id;
      const patientName = button.dataset.name;
      if (confirm(`Delete ${patientName}?`)) {
        fetch(`/patients/${patientId}`, {
          method: 'DELETE'
        }).then(res => {
          if (res.ok) {
            location.reload();
          }
        });
      }
    });
  });
});
