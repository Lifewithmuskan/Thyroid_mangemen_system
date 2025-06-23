const mongoose = require("mongoose");

const medicalInfoSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  currentDiagnosis: {
    type: [String],
    default:[],
  },
  currentMedication: {
    type: [String],
    default:[],
  },
  height: {
    type: Number,
    required: true,
    min: 0,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
  },
 bloodPressure: {
 
    diastolic: {
      type: Number,
      required: true,
      min: 0,
    },   systolic: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  goiter:{ 
   type: [String],
    default:[],
    
  },
  thyroidLevels: {
    ft3: { type: Number, required: true, min: 0 },
    ft4: { type: Number, required: true, min: 0 },
    tsh: { type: Number, required: true, min: 0 },
    t3: { type: Number, required: true, min: 0 },
    tpo: { type: Number, min: 0 },
  },
  thyroidType: {
    type: String,
    enum: ["Normal", "Hypothyroid", "Hyperthyroid"],
    required: true,
  },
  dateRecorded: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MedicalInfo", medicalInfoSchema);
// const mongoose = require("mongoose");

// const medicalInfoSchema = new mongoose.Schema({
//   patient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Patient",
//     required: true,
//   },

//   currentDiagnosis: {
//     type: [String],
//     default: [],
//   },

//   currentMedication: {
//     type: [String],
//     default: [],
//   },

//   height: {
//     type: Number,
//     required: true,
//     min: 0,
//   },

//   weight: {
//     type: Number,
//     required: true,
//     min: 0,
//   },

//   bloodPressure: {
//     systolic: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     diastolic: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//   },

//   thyroidLevels: {
//     ft3: { type: Number, required: true, min: 0 },
//     ft4: { type: Number, required: true, min: 0 },
//     tsh: { type: Number, required: true, min: 0 },
//     t3: { type: Number, required: true, min: 0 },
//     tpo: { type: Number, min: 0 },
//   },

//   thyroidType: {
//     type: String,
//     enum: ["Normal", "Hypothyroid", "Hyperthyroid"],
//     required: true,
//   },

//   lipidProfile: {
//     cholesterol: { type: Number, min: 0 },
//     triglycerides: { type: Number, min: 0 },
//     hdl: { type: Number, min: 0 },
//     ldl: { type: Number, min: 0 },
//   },

//   glucoseLevels: {
//     fasting: { type: Number, min: 0 },
//     postPrandial: { type: Number, min: 0 },
//   },

//   kidneyFunction: {
//     bloodUrea: { type: Number, min: 0 },
//     uricAcid: { type: Number, min: 0 },
//     creatinine: { type: Number, min: 0 },
//   },

//   liverFunction: {
//     totalBilirubin: { type: Number, min: 0 },
//     directBilirubin: { type: Number, min: 0 },
//     indirectBilirubin: { type: Number, min: 0 },
//     totalProtein: { type: Number, min: 0 },
//     albumin: { type: Number, min: 0 },
//     globulin: { type: Number, min: 0 },
//     sgot: { type: Number, min: 0 },
//     sgpt: { type: Number, min: 0 },
//     alkalinePhosphatase: { type: Number, min: 0 },
//   },

//   minerals: {
//     calcium: { type: Number, min: 0 },
//     phosphorus: { type: Number, min: 0 },
//   },

//   serology: {
//     hbsag: { type: String },
//     widal: { type: String },
//     raFactor: { type: String },
//     psa: { type: String },
//     vdrl: { type: String },
//   },

//   hematology: {
//     haemoglobin: { type: Number, min: 0 },
//     tlc: { type: Number, min: 0 },
//     neutrophils: { type: Number, min: 0 },
//     lymphocytes: { type: Number, min: 0 },
//     monocytes: { type: Number, min: 0 },
//     eosinophils: { type: Number, min: 0 },
//     basophils: { type: Number, min: 0 },
//     plateletCount: { type: Number, min: 0 },
//   },

//   rbcIndices: {
//     pcv: { type: Number, min: 0 },
//     mcv: { type: Number, min: 0 },
//     mch: { type: Number, min: 0 },
//     mchc: { type: Number, min: 0 },
//   },

//   urineExamination: {
//     colour: { type: String },
//     appearance: { type: String },
//     specificGravity: { type: Number, min: 0 },
//     albumin: { type: String },
//     sugar: { type: String },
//     pusCell: { type: String },
//     rbc: { type: String },
//     crystals: { type: String },
//   },

//   customDiagnosis: {
//     type: String,
//   },

//   customMedication: {
//     type: String,
//   },

//   dateRecorded: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("MedicalInfo", medicalInfoSchema);
