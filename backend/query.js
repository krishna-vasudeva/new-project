const { Pool } = require("pg");
require("dotenv").config();
const { data } = require("./data.js");
const { TeacherData } = require("./data.js");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function connectToDatabase() {
  try {
    // Test the connection
    const client = await pool.connect();
    client.release();
    console.log("Connected to the database.");
    return pool;
  } catch (error) {
    console.error("Database Connection Failed !!!", error);
    throw error;
  }
}

async function createStudentTable() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      CREATE TABLE IF NOT EXISTS student (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rollno VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        semester VARCHAR(150) NOT NULL,
        branch VARCHAR(255) NOT NULL,
        year INT NOT NULL,
        photo VARCHAR(255)
      )
    `);
    client.release();
    console.log(result);
  } catch (error) {
    console.error("Error creating student table:", error);
    throw error;
  }
}

async function createTeacherTable() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      CREATE TABLE IF NOT EXISTS teacher (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        teacherId VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(50) NOT NULL,
        department VARCHAR(255) NOT NULL,
        photo VARCHAR(255)
      )
    `);
    client.release();
    console.log(result);
  } catch (error) {
    console.error("Error creating teacher table:", error);
    throw error;
  }
}

async function createSubjectTable() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      CREATE TABLE IF NOT EXISTS subject (
        subjectid VARCHAR(255) UNIQUE PRIMARY KEY,
        subjectname VARCHAR(255) NOT NULL,
        subjectcode VARCHAR(255) UNIQUE NOT NULL,
        semester VARCHAR(50) NOT NULL,
        branch VARCHAR(255) NOT NULL,
        degree VARCHAR(255) NOT NULL,
        allottedTeacher VARCHAR(150) NOT NULL,
        year INT NOT NULL
      )
    `);
    client.release();
    console.log(result);
  } catch (error) {
    console.error("Error creating subject table:", error);
    throw error;
  }
}

async function createRecordsTable() {
  try {
    const client = await pool.connect();
    const res = await client.query(`
      CREATE TABLE IF NOT EXISTS records (
        srno SERIAL PRIMARY KEY,
        subjectid VARCHAR(255) NOT NULL,
        subjectname VARCHAR(255) NOT NULL,
        studentname VARCHAR(255) NOT NULL,
        photo VARCHAR(255),
        ispresent BOOLEAN NOT NULL, 
        year INT NOT NULL,
        branch VARCHAR(255) NOT NULL,
        semester VARCHAR(255) NOT NULL,
        time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    client.release();
    console.log(res);
    return res;
  } catch (err) {
    console.log("Error occurred while creating records table!", err);
    throw err;
  }
}

async function createAttendanceTable() {
  try {
    const client = await pool.connect();

    // Create the ENUM type first
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
          CREATE TYPE attendance_status AS ENUM ('Present', 'Absent');
        END IF;
      END
      $$;
    `);

    // Create the attendance table
    const res = await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        attendance_id SERIAL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        subject_id VARCHAR(255) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        attendance_date DATE,
        status attendance_status,
        FOREIGN KEY (student_id) REFERENCES student(rollno),
        FOREIGN KEY (subject_id) REFERENCES subject(subjectid)
      )
    `);

    client.release();
    console.log(res);
    return res;
  } catch (err) {
    console.log("Error occurred while creating attendance table!", err);
    throw err;
  }
}


async function insertIntoTeacher(name, teacherId, password, department, photo) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `
      INSERT INTO teacher (name, teacherId, password, department, photo) 
      VALUES ($1, $2, $3, $4, $5)
    `,
      [name, teacherId, password, department, photo]
    );
    client.release();
    console.log(result);
  } catch (err) {
    console.error("Error while inserting into teacher table:", err);
    throw err;
  }
}

async function insertIntoStudent(
  name,
  rollno,
  password,
  semester,
  branch,
  year,
  photo
) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `
      INSERT INTO student (name, rollno, password, semester, branch, year, photo) 
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [name, rollno, password, semester, branch, year, photo]
    );
    client.release();
    console.log(result);
  } catch (err) {
    console.error("Error while inserting into student table:", err);
    throw err;
  }
}

async function insertData() {
  try {
    for (const item of data) {
      const { name, rollno, password, semester, branch, year } = item;
      await insertIntoStudent(name, rollno, password, semester, branch, year);
      console.log(`${name} inserted successfully`);
    }
  } catch (err) {
    console.error("Error while inserting data:", err);
    throw err;
  }
}

async function insertTeacherData() {
  try {
    for (const item of TeacherData) {
      const { name, teacherId, password, department, photo } = item;
      await insertIntoTeacher(name, teacherId, password, department, photo);
      console.log(`${name} inserted successfully`);
    }
  } catch (err) {
    console.error("Error while inserting teacher data:", err);
    throw err;
  }
}

async function getAllStudent(rollno) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT * FROM student WHERE rollno = $1
    `,
      [rollno]
    );
    client.release();
    return result.rows;
  } catch (error) {
    console.error("Error while getting all students:", error);
    throw error;
  }
}

async function getAllTeacher(teacherId) {
  try {
    const client = await pool.connect();
    const result = await client.query(
      `
      SELECT * FROM teacher WHERE teacherId = $1
    `,
      [teacherId]
    );
    client.release();
    return result.rows;
  } catch (error) {
    console.error("Error while getting all teacher:", error);
    throw error;
  }
}

async function insertIntoSubject(
  subjectid,
  subjectname,
  subjectcode,
  semester,
  branch,
  degree,
  allotedTeacher,
  year
) {
  try {
    const client = await pool.connect();
    const res = await client.query(
      `
      INSERT INTO subject (subjectid, subjectname, subjectcode, semester, branch, degree, allottedTeacher, year) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
      [
        subjectid,
        subjectname,
        subjectcode,
        semester,
        branch,
        degree,
        allotedTeacher,
        year,
      ]
    );
    client.release();
    return res;
  } catch (err) {
    console.error("Error while inserting subject:", err);
    throw err;
  }
}

async function uploadStudentImage(image, rollno) {
  try {
    const client = await pool.connect();
    const sqlInsert = "UPDATE student SET photo = $1 WHERE rollno = $2";
    const res = await client.query(sqlInsert, [image, rollno]);
    client.release();
    return res;
  } catch (err) {
    console.error("Error while updating photo in student table:", err);
    throw err;
  }
}

async function uploadTeacherImage(image, teacherId) {
  try {
    const client = await pool.connect();
    const sqlInsert = "UPDATE teacher SET photo = $1 WHERE teacherId = $2";
    const res = await client.query(sqlInsert, [image, teacherId]);
    client.release();
    return res;
  } catch (err) {
    console.error("Error while updating photo in teacher table:", err);
    throw err;
  }
}

async function getStudentImage(rollno) {
  try {
    const client = await pool.connect();
    const sqlQuery = "SELECT photo FROM student WHERE rollno = $1";
    const res = await client.query(sqlQuery, [rollno]);
    client.release();
    return res.rows;
  } catch (err) {
    console.error("Error while getting student photo:", err);
    throw err;
  }
}

async function getAllSubjects(teacherId) {
  try {
    const client = await pool.connect();
    const sqlQuery =
      teacherId.length === 0
        ? "SELECT * FROM subject"
        : "SELECT * FROM subject WHERE allottedTeacher = $1";
    const res = await client.query(
      sqlQuery,
      teacherId.length === 0 ? [] : [teacherId]
    );
    client.release();
    return res.rows;
  } catch (err) {
    console.error("Error while getting subjects:", err);
    throw err;
  }
}

async function getStudentRecords(subjectid, semester, branch, year) {
  try {
    const client = await pool.connect();
    const sqlQuery = `
      SELECT * FROM records WHERE subjectid = $1 AND semester = $2 AND branch = $3 AND year = $4
    `;
    const res = await client.query(sqlQuery, [
      subjectid,
      semester,
      branch,
      year,
    ]);
    client.release();
    return res.rows;
  } catch (err) {
    console.error("Error while getting student records:", err);
    throw err;
  }
}

async function getAllStudents() {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT * FROM student");
    client.release();
    return res.rows;
  } catch (err) {
    console.error("Error while getting all students:", err);
    throw err;
  }
}

async function updateSubject(
  subjectId,
  subjectname,
  subjectcode,
  semester,
  branch,
  degree
) {
  try {
    const client = await pool.connect();
    const sqlQuery = `
      UPDATE subject 
      SET subjectname = $1, subjectcode = $2, semester = $3, branch = $4, degree = $5 
      WHERE subjectid = $6
    `;
    const res = await client.query(sqlQuery, [
      subjectname,
      subjectcode,
      semester,
      branch,
      degree,
      subjectId,
    ]);
    client.release();
    return res;
  } catch (err) {
    console.error("Error while updating subject data:", err);
    throw err;
  }
}

async function getSubject(subjectid) {
  try {
    const client = await pool.connect();
    const query = "SELECT * FROM subject WHERE subjectid = $1";
    const result = await client.query(query, [subjectid]);
    client.release();
    return result.rows; // Assuming you want to return the rows from the query result
  } catch (error) {
    console.error("Error while getting subject from subjectId:", error);
    throw error;
  }
}

async function insertIntoAttendance(studentid, subjectid, studentname, status) {
  try {
    const client = await pool.connect();
    const query = `
      INSERT INTO attendance (student_id, subject_id, student_name, status, attendance_date)
      VALUES ($1, $2, $3, $4, CURRENT_DATE)
    `;
    const res = await client.query(query, [
      studentid,
      subjectid,
      studentname,
      status,
    ]);
    client.release();
    return res;
  } catch (err) {
    console.error("Error while inserting into attendance table:", err);
    throw err;
  }
}
async function insertattendance(data) {
  try {
    for (let index = 0; index < data.length; index++) {
      let { studentid, subjectid, studentname, photo, ispresent, subjectname } =
        data[index];
      ispresent = ispresent ? "Present" : "Absent";
      await insertIntoAttendance(studentid, subjectid, studentname, ispresent);
    }
    console.log(`All attendance saved successfully`);
  } catch (err) {
    console.error("Error while saving attendance:", err);
    throw err;
  }
}

async function getAttendance(subjectId, from, to) {
  try {
    console.log(subjectId, from, to);
    const client = await pool.connect();
    const query = `
      SELECT 
        student_id, 
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS total_present, 
        SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS total_absent, 
        COUNT(*) AS total_lectures 
      FROM 
        attendance 
      WHERE 
        subject_id = $1 
        AND attendance_date >= $2::date 
        AND attendance_date <= $3::date 
      GROUP BY 
        student_id
    `;
    const res = await client.query(query, [subjectId, from, to]);
    client.release();
    console.log("attendance", res.rows);
    return res.rows;
  } catch (err) {
    console.error("Error while getting attendance:", err);
    throw err;
  }
}

async function viewAttendence(subjectId) {
  const query = `
    SELECT 
      student_id,
      SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS total_present,
      SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) AS total_absent,
      COUNT(*) AS total_lectures
    FROM attendance
    WHERE subject_id = $1
    GROUP BY student_id
  `;

  try {
    const client = await pool.connect();
    const res = await client.query(query, [subjectId]);
    client.release(); // Release the client back to the pool
    return res.rows;
  } catch (err) {
    console.error("Error while viewing Attendance:", err);
  }
}
module.exports = {
  connectToDatabase,
  createStudentTable,
  createTeacherTable,
  createSubjectTable,
  createRecordsTable,
  createAttendanceTable,
  insertIntoTeacher,
  insertIntoStudent,
  insertIntoAttendance,
  insertData,
  insertattendance,
  insertTeacherData,
  getAllStudent,
  getAllTeacher,
  getAttendance,
  viewAttendence,
  getSubject,
  insertIntoSubject,
  updateSubject,
  uploadStudentImage,
  uploadTeacherImage,
  getStudentImage,
  getAllSubjects,
  getStudentRecords,
  getAllStudents,
};
