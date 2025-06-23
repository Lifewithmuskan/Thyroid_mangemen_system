const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');

const Patient = require('./models/Patient');
const MedicalInfo = require('./models/MedicalInfo');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/thyroidDB')
  .then(async () => {
    console.log('MongoDB connected ✅');

    // Load Excel file
    const workbook = XLSX.readFile(path.join(__dirname, 'Master file 2024.xlsx'));
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Function to determine thyroid type
    function determineThyroidType(t3, t4, tsh) {
      if (tsh > 4.5) return "Hypothyroid";
      if (tsh < 0.4) return "Hyperthyroid";
      return "Normal";
    }

    // Loop through rows
    for (const row of data) {
      try {
        const {
          NAME, AGE, SEX, ADDRESS, "MOBILE NO": MOBILE, "CURRENT DIAGONSIS": DIAGNOSIS,
          "CUREENT MEDICATION": MEDICATION, HEIGHT, WEIGHT,
          "BP Upper": BP_UP, "BP Lower": BP_LOW, T3, T4, TSH, DATE
        } = row;

        // Create Patient
        const patient = new Patient({
          name: NAME,
          age: Number(AGE),
          sex: SEX,
          contact: MOBILE.toString(),
          address: ADDRESS,
          appointmentDate: new Date(DATE),
        });

        const savedPatient = await patient.save();

        // Create Medical Info
        const medicalInfo = new MedicalInfo({
          patient: savedPatient._id,
          currentDiagnosis: DIAGNOSIS,
          currentMedication: MEDICATION,
          height: Number(HEIGHT),
          weight: Number(WEIGHT),
          bloodPressure: {
            upper: Number(BP_UP),
            lower: Number(BP_LOW),
          },
          thyroidLevels: {
            t3: Number(T3),
            t4: Number(T4),
            tsh: Number(TSH),
          },
          thyroidType: determineThyroidType(T3, T4, TSH),
          dateRecorded: new Date(DATE),
        });

        await medicalInfo.save();
        console.log(`✅ Imported: ${NAME}`);
      } catch (err) {
        console.error(`❌ Error with row: ${row.NAME}`, err);
      }
    }

    mongoose.disconnect();
    console.log('Import complete and disconnected from MongoDB 🔚');
  })
  .catch(err => {
    console.error('MongoDB connection error ❌', err);
  });
