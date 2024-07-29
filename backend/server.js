const express = require("express");
const { engine } = require("express-handlebars");
const {
  connectToDatabase,
  createAttendanceTable,
  createRecordsTable,
  createStudentTable,
  createSubjectTable,
  createTeacherTable,
  deleteSubject,
  getAllStudent,
  getAllStudents,
  getAllSubjects,
  getAllTeacher,
  getAttendance,
  getStudentImage,
  getSubject,
  getTeacherImage,
  insertData,
  insertIntoSubject,
  insertIntoTeacher,
  insertTeacherData,
  insertattendance,
  updateSubject,
  uploadStudentImage,
  uploadTeacherImage,
  viewAttendence,
} = require("./query");
require("dotenv").config();
const { error } = require("console");
const errorHandler = require("./errorHandler");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
// const { urid: uuidv4 } = require("uuid");



const app = express();
const port = process.env.PORT || 5000;
// const exphbs = engine;


app.use(cors({ origin: "*" }));
app.use(express.json());

connectToDatabase()
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.error("Error while connecting to database:", err);
  });

// createStudentTable()
//   .then(() => {
//     console.log("Table created successfully");
//     // Call insertData function after creating the table
//     return insertData();
//   })
//   .then(() => {
//     console.log("All data inserted successfully.");
//   })
//   .catch((err) => {
//     console.error("Error while creating student table or inserting data:", err);
//   });

// createTeacherTable()
//   .then(() => {
//     console.log("Table created successfully");
//     // Call insertData function after creating the table
//     return insertTeacherData()
//       .then(() => {
//         console.log("All data inserted successfully.");
//       })
//       .catch((err) => {
//         console.error("Error while inserting data in teacher table ", err);
//       });
//   })
//   .catch((err) => {
//     console.error("Error while creating teacher table ", err);
//   });

// createSubjectTable()
//   .then((res) => {
//     console.log("subject table created successfully.!");
//   })
//   .catch((err) => {
//     console.error("Error while creating subject table", err);
//   });

// createAttendanceTable()
//   .then((res) => {
//     console.log("Attendence table created successfully.!");
//   })
//   .catch((err) => {
//     console.log("Error while creating attendence table", err);
//   });
//  createRecordsTable()
//   .then((res) => {
//     console.log("Records table created successfully.!");
//   })
//   .catch((err) => {
//     console.log("Error while creating records table", err);
//   });

app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: false }));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${req.customFileName}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });
const extractFileName = (req, res, next) => {
  req.customFileName = req.headers["filename"];
  next();
};
app.post(
  "/uploadImage",
  extractFileName,
  upload.single("profileImage"),
  async (req, res, next) => {
    // Access uploaded image details (consider error handling for file upload)
    const imagePath = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Validate and handle missing image or body data
    if (!imagePath) {
      return res.status(400).json({ message: "Missing image file" });
    }

    const rollno = req.body.rollno;
    const teacherId = req.body.teacherId;

    if (!rollno && !teacherId) {
      return res
        .status(400)
        .json({ message: "Please provide either rollno or teacherId" });
    }

    try {
      // Upload based on available data
      console.log(rollno, teacherId);
      if (teacherId === "undefined") {
        await uploadStudentImage(imagePath, rollno);
        console.log("Image uploaded successfully (student)");
      } else if (rollno === "undefined") {
        await uploadTeacherImage(imagePath, teacherId);
        console.log("Image uploaded successfully (teacher)");
      }

      res.json({ imagePath, message: "Image uploaded successfully!" });
    } catch (err) {
      console.error("Error uploading image:", err);
      next(new Error("Image upload failed")); // Consider a more specific error message
    }
  }
);

// app.get("/image", (req, res, next) => {
//   let rollno = req.query.rollno;
//   let teacherId = req.query.teacherId;
//   if (rollno) {
//     getStudentImage(rollno)
//       .then((data) => {
//         console.log(data);
//         res.json({
//           path: data[0][0].photo,
//         });
//       })
//       .catch((err) => {
//         next(new Error("Pls update your Profile Image..!!"));
//       });
//   } else if (teacherId) {
//     getTeacherImage(teacherId)
//       .then((data) => {
//         console.log(data[0][0].photo);
//         res.json({
//           path: data[0][0].photo,
//         });
//       })
//       .catch((err) => {
//         next(new Error("Pls update your Profile Image..!!"));
//       });
//   } else {
//     next(new Error("Profile photo not found"));
//   }
// });

app.post("/student", (req, res, next) => {
  const rollno = req.query.rollno;
  const password = req.query.password;
  getAllStudent(rollno)
    .then((response) => {
      console.log("hii",response[0]);
      if (!response[0]) throw new Error("Student not found");
      const { id, name, rollno, password, semester, branch, year, photo } =
        response[0];
      // console.log(response[0][0]);
      res.json({
        id,
        rollno,
        name,
        password,
        semester,
        branch,
        year,
        photo,
        message: "login Successfully..!!",
      });
    })
    .catch((err) => {
      // console.error("error while getting student", err);
      next(err);
    });
});
// insertIntoSubject("jhgjgasd", "nskd", "hsakdh", "haskhd", 3, "jhskahd")
//   .then((res) => {
//     console.log("done");
//   })
//   .catch((err) => {
//     console.log("not done", err);
//   });
app.post("/teacher/createnewsubject", (req, res, next) => {
  try {
    const {
      subjectname,
      subjectcode,
      semester,
      branch,
      degree,
      allotedTeacher,
      year,
    } = req.body;
    console.log(req.body)
    const subjectId = uuidv4();
    // console.log(subjectId);
    insertIntoSubject(
      subjectId,
      subjectname,
      subjectcode,
      semester,
      branch,
      degree,
      allotedTeacher,
      year
    )
      .then((resp) => {
        // console.log("tresponse", resp);
        if (resp)
          return res.json({ message: "Subject created successfully..!" });
        else throw new Error("Req failed try again..!");
      })
      .catch((err) => {
        // console.log(err.errno);
        next(err);
      });
  } catch (err) {
    next(err);
  }
});

app.post("/teacher", (req, res, next) => {
  const teacherid = req.query.teacherid;
  const password = req.query.password;
  // console.log(typeof teacherid, password);
  getAllTeacher(teacherid)
    .then((response) => {
      // console.log("thii", response[0]);
      if (!response[0]) throw new Error("Teacher not found");
      const { id, name, teacherid, password, department, photo } =
        response[0];
      res.json({
        id,
        name,
        teacherid,
        password,
        department,
        photo,
        message: "login Successfully..!!",
      });
    })
    .catch((err) => {
      // console.error("error while getting teacher", err);
      next(err);
    });
});

app.get("/allsubjects", (req, res, next) => {
  const teacherid = req.query.teacherid;
  getAllSubjects(teacherid)
    .then((resp) => {
      // console.log("shii",resp);
      const subjects = resp;
      // console.log(resp[0]);
      res.json({
        subjects,
      });
    })
    .catch((err) => {
      next(err);
    });
});

app.delete("/deleteSubject:id", (req, res, next) => {
  const subjectId = req.params.id;
  console.log(subjectId);
  deleteSubject(subjectId)
    .then((resp) => {
      res.send({ message: "deleted successfully" });
    })
    .catch((err) => {
      console.log(err);
      next("Pls try again after some time !");
    });
});
app.get("/getstudents:id", (req, res, next) => {
  const subjectid = req.params.id;
  getSubject(subjectid)
    .then((resp) => {
      console.log(resp);
      const {
        subjectid,
        subjectname,
        subjectcode,
        semester,
        branch,
        degree,
        allotedTeacher,
        year,
      } = resp[0];
      // console.log(semester, branch);
      req.subjectname = subjectname;
      return getAllStudents(semester, branch)
        .then((resp) => {
          // console.log("students:",resp);
          res.send({
            subjectname: req.subjectname,
            students: resp,
            message: "All students fetched successfully..!",
          });
        })
        .catch((err) => {
          console.log("error occured while getting all students..!");
          next(new Error("error occured while getting all students..!"));
        });
    })
    .catch((err) => {
      console.log("Error occured while getting subject ", err);
      next(new Error("Our Server is Busy right Now!"));
    });
});
app.post("/teacher/editSubject", (req, res, next) => {
  const { subjectid, subjectname, subjectcode, semester, branch, degree } =
    req.body;
  updateSubject(subjectid, subjectname, subjectcode, semester, branch, degree)
    .then((resp) => {
      res.send({ message: "Subject info Updated Successfully" });
    })
    .catch((err) => {
      console.log(err);
      next("Pls try again after some time !");
    });
});

app.post("/commitAttendance", (req, res, next) => {
  const array = req.body.data;
  insertattendance(array)
    .then((resp) => {
      console.log("attendance",resp);
      res.send({ message: "All attendance saved successfully!!!" });
    })
    .catch((err) => {
      console.log("error occured while inserting attendence data", err);
      next(err);
    });
});

app.post("/attendance", (req, res) => {
  const { subjectId, from, to } = req.body;
  getAttendance(subjectId, from, to)
    .then((resp) => {
      console.log(resp[0]);
      console.log("attendance got successfully..!!");
      res.send({ list: resp, msg: "success" });
    })
    .catch((err) => console.log("error occured while getting"));
});
app.get("/getattendance", (req, res) => {
  // Extracting headers
  const { branch, semester, studentid, subjectid } = req.headers;
  console.log(branch, semester, studentid, subjectid);
  // Ensure subjectId and studentid are provided
  // if (!SubjectId || !Studentid) {
  //   return res
  //     .status(400)
  //     .json({ error: "subjectId and studentid are required in headers" });
  // }

  // Assuming viewAttendance is a function that returns a promise
  viewAttendence(subjectid)
    .then((resp) => {
      // Filtering response to get attendance of specific student
      // console.log(resp);
      const filteredResp = resp.filter((obj) => obj.student_id === studentid);
      res.status(200).json(filteredResp);
    })
    .catch((err) => {
      console.error("Error occurred while getting attendance:", err);
      res.status(500).json({ error: "Internal server error" });
    });
});

// // Templating engine
// app.engine("hbs", exphbs({ extname: ".hbs" }));
// app.set("view engine", "hbs");
// app.get("/", (req, res) => {
//   res.render("index");
// });
app.use(errorHandler);
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
