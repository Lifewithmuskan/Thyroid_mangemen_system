document.addEventListener('DOMContentLoaded', () => {
  const newUserBtn = document.getElementById('newUserBtn');
  const existingUserBtn = document.getElementById('existingUserBtn');
  const searchRegInput = document.getElementById('searchRegNo');

  newUserBtn.addEventListener('click', () => {
    document.getElementById('formSection').style.display = 'block';
    document.getElementById('searchSection').style.display = 'none';

    const fields = ['regNo', 'name', 'age', 'contact', 'address', 'aadharNo', 'appointmentDate'];
    fields.forEach(id => {
      const el = document.getElementById(id);
      el.value = '';
      el.readOnly = false;
    });

    document.getElementById('sex').value = '';
    document.getElementById('sex').disabled = false;
    document.getElementById('numberOfVisits').value = 1;
    document.getElementById('appointmentDate').value = new Date().toISOString().slice(0, 16);
  });

  existingUserBtn.addEventListener('click', () => {
    document.getElementById('searchSection').style.display = 'block';
    document.getElementById('formSection').style.display = 'none';
  });

  searchRegInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const regNo = searchRegInput.value.trim();
      if (!regNo) return alert("Please enter a registration number");

      try {
        const res = await fetch(`/api/patient/${regNo}`);
        const data = await res.json();

        if (!data || !data.name) {
          alert("No patient found with this registration number");
          return;
        }

        document.getElementById('formSection').style.display = 'block';
        document.getElementById('searchSection').style.display = 'none';

        document.getElementById('regNo').value = regNo;
        document.getElementById('name').value = data.name;
        document.getElementById('age').value = data.age;
        document.getElementById('sex').value = data.sex;
        document.getElementById('contact').value = data.contact;
        document.getElementById('address').value = data.address;
        document.getElementById('aadharNo').value = data.aadharNo;
        document.getElementById('appointmentDate').value = new Date().toISOString().slice(0, 16);
        document.getElementById('numberOfVisits').value = (data.numberOfVisits || 0) + 1;

        ['name', 'age', 'contact', 'address', 'aadharNo', 'regNo'].forEach(id => {
          document.getElementById(id).readOnly = true;
        });
        document.getElementById('sex').disabled = true;

      } catch (err) {
        console.error("Error fetching patient:", err);
        alert("Failed to fetch patient data.");
      }
    }
  });
});
