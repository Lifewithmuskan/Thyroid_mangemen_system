const express = require("express")
const mongoose = require("mongoose")
const session = require("express-session")
const path = require("path")
const bcrypt = require("bcrypt")

// Add security middleware at the top after other requires
const helmet = require("helmet")
const cors = require("cors")

// Import models
const Patient = require("./models/Patient")
const MedicalInfo = require("./models/MedicalInfo")
const Requisition  = require("./models/Requisition")
const Admin = require("./models/Admin")
const OtherInvestigation = require("./models/OtherInvestigation"); // Adjust path as needed
// Import database connection
require("./db")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static("public"))
app.use(
  session({
    secret: "thyroid-management-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
)

// Add after existing middleware setup
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      },
    },
  }),
)
app.use(cors())

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Set EJS as templating engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.adminId) {
    next()
  } else {
    res.redirect("/")
  }
}

// Helper function to determine thyroid type
const getThyroidType = (t3, t4, tsh) => {
  // Normal ranges: T3: 2.3-4.2, T4: 5.0-12.0, TSH: 0.4-4.0
  if (tsh > 4.0 || t3 < 2.3 || t4 < 5.0) {
    return "Hypothyroid"
  } else if (tsh < 0.4 || t3 > 4.2 || t4 > 12.0) {
    return "Hyperthyroid"
  } else {
    return "Normal"
  }
}

// Routes

// 1. Authentication Route
app.get("/", (req, res) => {
  if (req.session.adminId) {
    return res.redirect("/home")
  }
  res.render("auth", { error: null })
})

app.post("/login", async (req, res) => {
  const { username, password } = req.body

  try {
    // Check hardcoded admin first
    if (username === "admin" && password === "admin123") {
      req.session.adminId = "hardcoded-admin"
      return res.redirect("/home")
    }

    // Check database admins
    const admin = await Admin.findOne({ username })
    if (admin && (await bcrypt.compare(password, admin.password))) {
      req.session.adminId = admin._id
      return res.redirect("/home")
    }

    res.render("auth", { error: "Invalid credentials" })
  } catch (error) {
    res.render("auth", { error: "Login failed" })
  }
})

app.post("/signup", async (req, res) => {
  const { username, password, confirmPassword } = req.body

  try {
    if (password !== confirmPassword) {
      return res.render("auth", { error: "Passwords do not match" })
    }

    const existingAdmin = await Admin.findOne({ username })
    if (existingAdmin) {
      return res.render("auth", { error: "Username already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const admin = new Admin({ username, password: hashedPassword })
    await admin.save()

    req.session.adminId = admin._id
    res.redirect("/home")
  } catch (error) {
    res.render("auth", { error: "Signup failed" })
  }
})

// 2. Home Dashboard
app.get("/home", requireAuth, (req, res) => {
  res.render("home")
})

// Example: in routes/diagnosis.js or directly in app.js

// app.get('/other-investigation', (req, res) => {
//     res.render('other-investigation', {
//         title: 'Other Investigations - Thyroid Department'
//     });
// });
app.get('/other-investigation', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ name: 1 });
    res.render('other-investigation', {
      title: 'Other Investigations - Thyroid Department',
      patients,
    });
  } catch (err) {
    console.error("Error loading patients:", err.message);
    res.render('other-investigation', {
      title: 'Other Investigations - Thyroid Department',
      patients: [],
      error: "Failed to load patients.",
    });
  }
});
app.post("/submit-other-investigation", async (req, res) => {
  try {
    const {
      patientId,
      visitNumber,
      cholesterol,
      triglycerides,
      hdlChol,
      ldlChol,
      glucoseFasting,
      glucosePP,
      urea,
      uricAcid,
      creatinine,
      bilirubinTotal,
      bilirubinDirect,
      bilirubinIndirect,
      totalProtein,
      albumin,
      globulin,
      sgot,
      sgpt,
      alkalinePhosphatase,
      calcium,
      phosphorus,
      hbsag,
      widal,
      raFactor,
      psa,
      vdrl,
      hb,
      tlc,
      neutrophils,
      lymphocytes,
      monocytes,
      eosinophils,
      basophils,
      plateletCount,
      pcv,
      mcv,
      mch,
      mchc,
      urineColor,
      urineAppearance,
      urineSpecificGravity,
      urineAlbumin,
      urineSugar,
      urinePusCell,
      urineRBC,
      urineCrystals,
    } = req.body;

    const newEntry = new OtherInvestigation({
      patient: patientId,
      visitNumber: parseInt(visitNumber),

      lipidProfile: {
        cholesterol: Number(cholesterol),
        triglycerides: Number(triglycerides),
        hdl: Number(hdlChol),
        ldl: Number(ldlChol),
      },
      glucoseLevels: {
        fasting: Number(glucoseFasting),
        postPrandial: Number(glucosePP),
      },
      kidneyFunction: {
        bloodUrea: Number(urea),
        uricAcid: Number(uricAcid),
        creatinine: Number(creatinine),
      },
      liverFunction: {
        totalBilirubin: Number(bilirubinTotal),
        directBilirubin: Number(bilirubinDirect),
        indirectBilirubin: Number(bilirubinIndirect),
        totalProtein: Number(totalProtein),
        albumin: Number(albumin),
        globulin: Number(globulin),
        sgot: Number(sgot),
        sgpt: Number(sgpt),
        alkalinePhosphatase: Number(alkalinePhosphatase),
      },
      minerals: {
        calcium: Number(calcium),
        phosphorus: Number(phosphorus),
      },
      serology: {
        hbsag,
        widal,
        raFactor,
        psa,
        vdrl,
      },
      hematology: {
        haemoglobin: Number(hb),
        tlc: Number(tlc),
        neutrophils: Number(neutrophils),
        lymphocytes: Number(lymphocytes),
        monocytes: Number(monocytes),
        eosinophils: Number(eosinophils),
        basophils: Number(basophils),
        plateletCount: Number(plateletCount),
      },
      rbcIndices: {
        pcv: Number(pcv),
        mcv: Number(mcv),
        mch: Number(mch),
        mchc: Number(mchc),
      },
      urineExamination: {
        colour: urineColor,
        appearance: urineAppearance,
        specificGravity: Number(urineSpecificGravity),
        albumin: urineAlbumin,
        sugar: urineSugar,
        pusCell: urinePusCell,
        rbc: urineRBC,
        crystals: urineCrystals,
      },
    });

    await newEntry.save();

    // 🔁 Redirect to dashboard after successful save
    res.redirect("/home");

  } catch (error) {
    console.error("Error submitting investigation:", error.message);
    res.status(500).send("Internal Server Error");
  }
});


app.get('/patients/:patientId/records/:recordId', async (req, res) => {
  try {
    const { patientId, recordId } = req.params;

    const patient = await Patient.findById(patientId);
    const medicalInfo = await MedicalRecord.findById(recordId);
    const otherInvestigation = await OtherInvestigation.findOne({ medicalRecordId: recordId });

    if (!patient || !medicalInfo) {
      return res.status(404).send("Patient or medical record not found");
    }

    res.render('recordDetails', {
      patient,
      medicalInfo,
      otherInvestigation
    });
  } catch (error) {
    console.error('Error loading record details:', error);
    res.status(500).send("Something went wrong while loading record details.");
  }
});



// 3. Register New Patient
app.get('/register', (req, res) => {
    const registrationNumber = 'REG-' + Math.floor(100000 + Math.random() * 900000);
    res.render('register', { registrationNumber, success: null, error: null });
});



// app.post('/register', async (req, res) => {
//   try {
//     const newPatient = new Patient({
//       name: req.body.name,
//       age: req.body.age,
//       sex: req.body.sex,
//       contact: req.body.contact,
//       address: req.body.address,
//       appointmentDate: new Date(req.body.appointmentDate),
//       aadharNo: req.body.aadharNo,
//     });

//     await newPatient.save();
//     res.redirect('/patients');
//   } catch (err) {
//     console.error('Error saving patient:', err);
//     res.status(500).render('register', {
//       registrationNumber: req.body.regNo,
//       success: null,
//       error: 'Failed to register patient. Please check all fields and try again.',
//     });
//   }
// });

app.post('/register', async (req, res) => {
  try {
    const regNo = req.body.regNo;
    const existingPatient = regNo ? await Patient.findOne({ registrationNo: regNo }) : null;

    if (existingPatient) {
      // Update existing patient
      existingPatient.appointmentDate = new Date(req.body.appointmentDate);
      existingPatient.numberOfVisits += 1;
      await existingPatient.save();

      res.redirect('/patients'); // or res.render(...) if needed
    } else {
      // New patient - will auto-generate registrationNo using pre('save')
      const newPatient = new Patient({
        name: req.body.name,
        age: req.body.age,
        sex: req.body.sex,
        contact: req.body.contact,
        address: req.body.address,
        appointmentDate: new Date(req.body.appointmentDate),
        aadharNo: req.body.aadharNo,
        numberOfVisits: req.body.numberOfVisits || 1,
      });

      await newPatient.save();
      res.redirect('/patients');
    }
  } catch (err) {
    console.error('Error saving patient:', err);
    res.status(500).render('register', {
      registrationNumber: req.body.regNo,
      success: null,
      error: 'Failed to register patient. Please check all fields and try again.',
    });
  }
});
app.get('/api/visits/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const count = await MedicalInfo.countDocuments({ patient: patientId });
    res.json({ totalVisits: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch visit count" });
  }
});

app.get('/api/patient/:regNo', async (req, res) => {
  try {
    const patient = await Patient.findOne({ registrationNo: req.params.regNo });
    if (patient) {
      res.json(patient);
    } else {
      res.json({});
    }
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({});
  }
});



// app.post("/register", requireAuth, async (req, res) => {
//   try {
//     const { name, age, sex, contact, address, appointmentDate, aadharNo } = req.body;

//     // Create new Patient instance
//     const patient = new Patient({
//       name,
//       age: parseInt(age),
//       sex,
//       contact,
//       address,
//       appointmentDate: new Date(appointmentDate),
//       aadharNo
//     });

//     // Save patient — registrationNo will be auto-generated by schema pre 'save' hook
//     await patient.save();

//     res.render("register", { success: "Patient registered successfully!", error: null });
//   } catch (error) {
//     console.error(error);
//     res.render("register", { success: null, error: "Failed to register patient" });
//   }
// });


// 4. Enter Diagnosis Information
app.get("/information", requireAuth, async (req, res) => {
  try {
    const patients = await Patient.find().sort({ name: 1 })
    res.render("information", { patients, success: null, error: null })
  } catch (error) {
    res.render("information", { patients: [], success: null, error: "Failed to load patients" })
  }
})
// app.post("/information", requireAuth, async (req, res) => {
//   try {
//     const {
//       patientId,
//       currentDiagnosis,
//       diagnosisOptions,
//       currentMedication,
//       medicationOptions,
//       height,
//       weight,
//       bpUpper,
//       bpLower,
//       ft3,
//       t3,
//       t4,
//       tsh
//     } = req.body;

//     const diagnosis = [
//       ...(Array.isArray(diagnosisOptions) ? diagnosisOptions : diagnosisOptions ? [diagnosisOptions] : []),
//       ...(currentDiagnosis ? [currentDiagnosis] : [])
//     ].filter(Boolean);

//     const medication = [
//       ...(Array.isArray(medicationOptions) ? medicationOptions : medicationOptions ? [medicationOptions] : []),
//       ...(currentMedication ? [currentMedication] : [])
//     ].filter(Boolean);

//     const medicalInfo = new MedicalInfo({
//       patient: patientId,
//       currentDiagnosis: diagnosis,
//       currentMedication: medication,
//       height: parseFloat(height),
//       weight: parseFloat(weight),
//       bloodPressure: {
//         upper: parseInt(bpUpper),
//         lower: parseInt(bpLower),
//       },
//       thyroidLevels: {
//         ft3: parseFloat(ft3),
//         t4: parseFloat(t4),
//         tsh: parseFloat(tsh),
//         t3: parseFloat(t3),
//       },
//       thyroidType: getThyroidType(parseFloat(ft3), parseFloat(t4), parseFloat(tsh)),
//     });

//     await medicalInfo.save();

//     const patients = await Patient.find().sort({ name: 1 });
//     res.render("information", {
//       patients,
//       success: "Medical information saved successfully!",
//       error: null,
//     });
//   } catch (error) {
//     console.error(error);
//     const patients = await Patient.find().sort({ name: 1 });
//     res.render("information", {
//       patients,
//       success: null,
//       error: "Failed to save medical information",
//     });
    
//   }
// });

// app.post("/information", requireAuth, async (req, res) => {
//   try {
//     const {
//       patientId,
//       currentDiagnosis,
//       currentMedication,
//       height,
//       weight,
//       bpUpper,
//       bpLower,
//       ft3,    // updated from t3
//       t4,
//       tsh,
//       t3t5    // new field
//     } = req.body;

//     const medicalInfo = new MedicalInfo({
//       patient: patientId,
//       currentDiagnosis: Array.isArray(currentDiagnosis) ? currentDiagnosis : [currentDiagnosis],
//       currentMedication: Array.isArray(currentMedication) ? currentMedication : [currentMedication],
//       height: Number.parseFloat(height),
//       weight: Number.parseFloat(weight),
//       bloodPressure: {
//         upper: Number.parseInt(bpUpper),
//         lower: Number.parseInt(bpLower),
//       },
//       thyroidLevels: {
//         ft3: Number.parseFloat(ft3),
//         t4: Number.parseFloat(t4),
//         tsh: Number.parseFloat(tsh),
//         t3t5: Number.parseFloat(t3t5),
//       },
//       thyroidType: getThyroidType(Number.parseFloat(ft3), Number.parseFloat(t4), Number.parseFloat(tsh)),
//       dateRecorded: new Date(),
//     });

//     await medicalInfo.save();

//     const patients = await Patient.find().sort({ name: 1 });
//     res.render("information", { patients, success: "Medical information saved successfully!", error: null });
//   } catch (error) {
//     const patients = await Patient.find().sort({ name: 1 });
//     res.render("information", { patients, success: null, error: "Failed to save medical information" });
//   }
// });


// app.post("/information", requireAuth, async (req, res) => {
//   try {
//     const { patientId, currentDiagnosis, currentMedication, height, weight, bpUpper, bpLower, t3, t4, tsh } = req.body

//     const medicalInfo = new MedicalInfo({
//       patient: patientId,
//       currentDiagnosis,
//       currentMedication,
//       height: Number.parseFloat(height),
//       weight: Number.parseFloat(weight),
//       bloodPressure: {
//         upper: Number.parseInt(bpUpper),
//         lower: Number.parseInt(bpLower),
//       },
//       thyroidLevels: {
//         t3: Number.parseFloat(t3),
//         t4: Number.parseFloat(t4),
//         tsh: Number.parseFloat(tsh),
//       },
//       thyroidType: getThyroidType(Number.parseFloat(t3), Number.parseFloat(t4), Number.parseFloat(tsh)),
//       dateRecorded: new Date(),
//     })

//     await medicalInfo.save()

//     const patients = await Patient.find().sort({ name: 1 })
//     res.render("information", { patients, success: "Medical information saved successfully!", error: null })
//   } catch (error) {
//     const patients = await Patient.find().sort({ name: 1 })
//     res.render("information", { patients, success: null, error: "Failed to save medical information" })
//   }
// })

// 5. View Patients

// Helper functions
function safeParseFloat(value) {
  const num = parseFloat(value);
  return isNaN(num) ? undefined : num;
}

function safeParseInt(value) {
  const num = parseInt(value);
  return isNaN(num) ? undefined : num;
}

app.post("/information", requireAuth, async (req, res) => {
  try {
    const {
      patientId,
      currentDiagnosis = [],
      customDiagnosis,
      currentMedication = [],
      customMedication,
      height,
      weight,
      bpUpper,
      bpLower,
      ft3,
      ft4,
      tsh,
      t3,
      tpo,
      goiter = []
    } = req.body;

    if (!patientId) {
      throw new Error("Patient ID is required.");
    }

    // Normalize currentDiagnosis and currentMedication as arrays
    const diagnoses = Array.isArray(currentDiagnosis)
      ? currentDiagnosis
      : [currentDiagnosis];

    const medications = Array.isArray(currentMedication)
      ? currentMedication
      : [currentMedication];

    // Append custom entries if provided
    if (customDiagnosis && customDiagnosis.trim()) {
      diagnoses.push(customDiagnosis.trim());
    }

    if (customMedication && customMedication.trim()) {
      medications.push(customMedication.trim());
    }

    // Normalize goiter as array (can be from checkbox with name="goiter[]")
    const goiterList = Array.isArray(goiter) ? goiter : [goiter];

    // Calculate BMI (rounded to 2 decimals)
    const parsedHeight = parseFloat(height);
    const parsedWeight = parseFloat(weight);
    const bmi =
      parsedHeight && parsedWeight
        ? parseFloat((parsedWeight / ((parsedHeight / 100) ** 2)).toFixed(2))
        : undefined;

    // Create and save document
    const medicalInfo = new MedicalInfo({
      patient: patientId,
      currentDiagnosis: diagnoses,
      currentMedication: medications,
      height: parsedHeight,
      weight: parsedWeight,
      bloodPressure: {
        systolic: parseInt(bpUpper),
        diastolic: parseInt(bpLower),
      },
      bmi,
      goiter: goiterList,
      thyroidLevels: {
        ft3: parseFloat(ft3),
        ft4: parseFloat(ft4),
        tsh: parseFloat(tsh),
        t3: parseFloat(t3),
        tpo: parseFloat(tpo),
      },
      thyroidType: getThyroidType(parseFloat(ft3), parseFloat(ft4), parseFloat(tsh)),
    });

    await medicalInfo.save();

    const patients = await Patient.find().sort({ name: 1 });
    res.render("information", {
      patients,
      success: "Medical information saved successfully!",
      error: null,
    });
  } catch (error) {
    console.error("Error in POST /information:", error.message || error);
    const patients = await Patient.find().sort({ name: 1 });
    res.render("information", {
      patients,
      success: null,
      error: error.message || "An error occurred while saving.",
    });
  }
});




app.get("/patients", requireAuth, async (req, res) => {
  try {
    const { search } = req.query
    let query = {}

    if (search) {
      query = {
        $or: [{ name: { $regex: search, $options: "i" } }, { contact: { $regex: search, $options: "i" } }],
      }
    }

    const patients = await Patient.find(query).sort({ appointmentDate: -1 })

    // Get latest medical info for each patient
    const patientsWithMedicalInfo = await Promise.all(
      patients.map(async (patient) => {
        const latestMedicalInfo = await MedicalInfo.findOne({ patient: patient._id }).sort({ dateRecorded: -1 })
        return {
          ...patient.toObject(),
          latestMedicalInfo,
        }
      }),
    )

    res.render("patients", { patients: patientsWithMedicalInfo, search: search || "" })
  } catch (error) {
    res.render("patients", { patients: [], search: "" })
  }
})
// app.post('/patients/:id/delete', async (req, res) => {
//   try {
//     await Patient.findByIdAndDelete(req.params.id);
//     res.sendStatus(200); // ✅ Don't redirect
//   } catch (err) {
//     console.error('Error deleting patient:', err);
//     res.status(500).send('Failed to delete patient');
//   }
// });

app.delete('/patients/:id', async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error deleting patient:', err);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});



app.get("/record/:patientId/:recordId", async (req, res) => {
  try {
    const { patientId, recordId } = req.params;

    const patient = await Patient.findById(patientId);
    const record = await MedicalInfo.findById(recordId);

    if (!record) {
      return res.status(404).render("error", { error: "Medical record not found" });
    }

    const start = new Date(record.dateRecorded);
    start.setHours(0, 0, 0, 0);
    const end = new Date(record.dateRecorded);
    end.setHours(23, 59, 59, 999);

    const otherInvestigation = await OtherInvestigation.findOne({
      patient: patientId,
      dateRecorded: { $gte: start, $lte: end }
    });

    res.render("record-detail", {
      patient,
      record,
      otherInvestigation // 👈 this is required to avoid the ReferenceError
    });

  } catch (err) {
    console.error(err);
    res.status(500).render("error", { error: "Failed to load record details" });
  }
});


// app.get('/patients/:patientId/print-form/:recordId', async (req, res) => {
//     const { patientId, recordId } = req.params;
//     const { date } = req.query;

//     try {
//         const patient = await Patient.findById(patientId);
//         const medicalRecord = await MedicalRecord.findOne({
//             _id: recordId,
//             patient: patientId,
//             dateRecorded: new Date(date)
//         });
//         const otherInvestigation = await OtherInvestigation.findOne({
//             patient: patientId,
//             dateRecorded: new Date(date)
//         });

//         if (!medicalRecord) {
//             return res.status(404).send('Medical record not found for given date.');
//         }

//         res.render('print-form', {
//             patient,
//             medicalRecord,
//             otherInvestigation
//         });
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server error');
//     }
// });
// app.get('/patients/:patientId/print-form/:recordId', async (req, res) => {
//   const { patientId, recordId } = req.params;
//   const { date } = req.query;

//   const patient = await Patient.findById(patientId);
//   const medicalRecord = await medicalRecord.findById(recordId);
//   const otherInvestigation = await OtherInvestigation.findOne({
//     patientId,
//     date: new Date(date)
//   });

//   res.render('print-form', {
//     patient,
//     medicalRecord,
//     otherInvestigation,
//     date: new Date(date).toLocaleDateString()
//   });
// });



// Patient detail view

app.get('/print-form/:patientId/:recordId', async (req, res) => {
  try {
    const { patientId, recordId } = req.params;

    const patient = await Patient.findById(patientId);
    const record = await MedicalInfo.findById(recordId);

    if (!record) {
      return res.status(404).render("error", { error: "Medical record not found" });
    }

    const start = new Date(record.dateRecorded);
    start.setHours(0, 0, 0, 0);
    const end = new Date(record.dateRecorded);
    end.setHours(23, 59, 59, 999);

    const otherInvestigation = await OtherInvestigation.findOne({
      patient: patientId,
      dateRecorded: { $gte: start, $lte: end }
    });

    res.render("print-form", {
      patient,
      record,
      otherInvestigation,
      date: new Date(record.dateRecorded).toLocaleDateString()
    });

  } catch (err) {
    console.error(err);
    res.status(500).render("error", { error: "Failed to load test requisition form" });
  }
});
// app.post('/submit-requisition/:patientId', async (req, res) => {
//   const { patientId } = req.params;
//   const { tests, ctDetails, fnacDetails, sampleCollector } = req.body;

//   try {
//     const requisition = {
//       patient: patientId,
//       tests: tests || [],
//       ctDetails,
//       fnacDetails,
//       sampleCollector,
//       date: new Date(),
//     };

//     // Create your Requisition model and save
//     await Requisition.create(requisition);

//     res.send('Test requisition form submitted successfully!');
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Error saving requisition');
//   }
// });
const RequisitionForm = require('./models/Requisition'); // ✅ You missed this

app.use(express.urlencoded({ extended: true }));

app.post('/submit-requisition/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const { tests, ctDetails, fnacDetails, sampleCollector } = req.body;

    const newForm = new RequisitionForm({
      patient: patientId,
      tests: Array.isArray(tests) ? tests : [tests],
      ctDetails,
      fnacDetails,
      sampleCollector,
    });

    await newForm.save();
    res.redirect(`/print-form/${patientId}/${newForm._id}`);
  } catch (err) {
    console.error('Failed to save requisition form:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get("/patients/:id", requireAuth, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
    if (!patient) {
      return res.status(404).render("error", { error: "Patient not found" })
    }

    const medicalRecords = await MedicalInfo.find({ patient: req.params.id }).sort({ dateRecorded: -1 })
    const latestRecord = medicalRecords[0] || null

    res.render("patient-detail", { patient, medicalRecords, latestRecord })
  } catch (error) {
    res.render("error", { error: "Failed to load patient details" })
  }
})

// Delete patient
// app.post("/patients/:id/delete", requireAuth, async (req, res) => {
//   try {
//     await MedicalInfo.deleteMany({ patient: req.params.id })
//     await Patient.findByIdAndDelete(req.params.id)
//     res.redirect("/patients")
//   } catch (error) {
//     res.redirect("/patients")
//   }
// })

// 6. View History with Filters
app.get("/history", requireAuth, async (req, res) => {
  try {
    const { dateFilter, thyroidType } = req.query
    const query = {}

    // Date filter
    if (dateFilter) {
      const now = new Date()
      let startDate

      switch (dateFilter) {
        case "7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "1month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case "1year":
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
      }

      if (startDate) {
        query.dateRecorded = { $gte: startDate }
      }
    }

    // Thyroid type filter
    if (thyroidType && thyroidType !== "all") {
      query.thyroidType = thyroidType
    }

    const medicalRecords = await MedicalInfo.find(query).populate("patient").sort({ dateRecorded: -1 })

    res.render("history", {
      medicalRecords,
      filters: { dateFilter, thyroidType },
    })
  } catch (error) {
    res.render("history", {
      medicalRecords: [],
      filters: { dateFilter: "", thyroidType: "" },
    })
  }
})

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy()
  res.redirect("/")
})

// Add new routes after the existing routes:

// Stats dashboard
app.get("/stats", requireAuth, async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments()
    const totalRecords = await MedicalInfo.countDocuments()

    // Thyroid type distribution
    const thyroidStats = await MedicalInfo.aggregate([
      {
        $group: {
          _id: "$thyroidType",
          count: { $sum: 1 },
        },
      },
    ])

    const stats = {
      totalPatients,
      normalThyroid: thyroidStats.find((s) => s._id === "Normal")?.count || 0,
      hypothyroid: thyroidStats.find((s) => s._id === "Hypothyroid")?.count || 0,
      hyperthyroid: thyroidStats.find((s) => s._id === "Hyperthyroid")?.count || 0,
    }

    // Age groups
    const patients = await Patient.find()
    const ageGroups = {
      young: patients.filter((p) => p.age <= 30).length,
      middle: patients.filter((p) => p.age > 30 && p.age <= 60).length,
      senior: patients.filter((p) => p.age > 60).length,
    }
    stats.ageGroups = ageGroups

    // Monthly trends
    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    stats.thisMonth = await Patient.countDocuments({
      registeredDate: { $gte: thisMonthStart },
    })

    stats.lastMonth = await Patient.countDocuments({
      registeredDate: { $gte: lastMonthStart, $lte: lastMonthEnd },
    })

    // Recent appointments
    const recentAppointments = await Patient.find()
      .sort({ appointmentDate: -1 })
      .limit(5)
      .select("name age appointmentDate")

    res.render("dashboard-stats", { stats, recentAppointments })
  } catch (error) {
    res.render("error", { error: "Failed to load statistics" })
  }
})

// API endpoint for real-time stats
app.get("/api/stats", requireAuth, async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments()

    // Today's appointments
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayAppointments = await Patient.countDocuments({
      appointmentDate: { $gte: today, $lt: tomorrow },
    })

    // Patients without medical records (pending diagnosis)
    const patientsWithRecords = await MedicalInfo.distinct("patient")
    const pendingDiagnosis = totalPatients - patientsWithRecords.length

    // Recent records (last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentRecords = await MedicalInfo.countDocuments({
      dateRecorded: { $gte: weekAgo },
    })

    res.json({
      totalPatients,
      todayAppointments,
      pendingDiagnosis,
      recentRecords,
    })
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" })
  }
})

// Add export routes after the stats routes:

// Export page
app.get("/export", requireAuth, (req, res) => {
  res.render("export")
})

// Handle export
app.post("/export", requireAuth, async (req, res) => {
  try {
    const { exportType, format, startDate, endDate, thyroidFilter } = req.body

    let data = []
    let filename = `thyroid_export_${new Date().toISOString().split("T")[0]}`

    // Build query for date filtering
    let dateQuery = {}
    if (startDate && endDate) {
      dateQuery = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z"),
      }
    }

    switch (exportType) {
      case "patients":
        const patientQuery = {}
        if (startDate && endDate) {
          patientQuery.registeredDate = dateQuery
        }
        data = await Patient.find(patientQuery).lean()
        filename += "_patients"
        break

      case "medical":
        const medicalQuery = {}
        if (startDate && endDate) {
          medicalQuery.dateRecorded = dateQuery
        }
        if (thyroidFilter) {
          medicalQuery.thyroidType = thyroidFilter
        }
        data = await MedicalInfo.find(medicalQuery).populate("patient").lean()
        filename += "_medical"
        break

      case "complete":
        const patients = await Patient.find().lean()
        const medicalRecords = await MedicalInfo.find().populate("patient").lean()
        data = { patients, medicalRecords }
        filename += "_complete"
        break
    }

    // Set response headers
    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv")
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`)

      // Convert to CSV (simplified)
      if (Array.isArray(data) && data.length > 0) {
        const headers = Object.keys(data[0]).join(",")
        const rows = data.map((row) => Object.values(row).join(",")).join("\n")
        res.send(headers + "\n" + rows)
      } else {
        res.send("No data available")
      }
    } else {
      res.setHeader("Content-Type", "application/json")
      res.setHeader("Content-Disposition", `attachment; filename="${filename}.json"`)
      res.send(JSON.stringify(data, null, 2))
    }
  } catch (error) {
    res.render("error", { error: "Failed to export data" })
  }
})

// Add after the existing middleware:
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).render("error", { error: "Something went wrong!" })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
