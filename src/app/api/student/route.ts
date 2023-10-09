import { getPrisma } from "@/libs/getPrisma";
import { Student } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type StudentGetResponse = {
  students: Student[];
};

export const GET = async () => {
  const prisma = getPrisma();
  
  // Fetch a list of students from the database
  const students = await prisma.student.findMany();

  return NextResponse.json<StudentGetResponse>({
    students,
  });
};

export type StudentPostOKResponse = { ok: true };
export type StudentPostErrorResponse = { ok: false; message: string };
export type StudentPostResponse =
  | StudentPostOKResponse
  | StudentPostErrorResponse;

export type StudentPostBody = Pick<
  Student,
  "studentId" | "firstName" | "lastName"
>;

export const POST = async (request: NextRequest) => {
  const body = (await request.json()) as StudentPostBody;
  const prisma = getPrisma();

  // Check if a student with the same studentId already exists
  const existingStudent = await prisma.student.findUnique({
    where: {
      studentId: body.studentId,
    },
  });

  if (existingStudent) {
    // Return an error response if the studentId already exists
    return NextResponse.json<StudentPostErrorResponse>(
      { ok: false, message: "Student Id already exists" },
      { status: 400 }
    );
  }

  // If the studentId doesn't exist, create a new student
  const newStudent = await prisma.student.create({
    data: {
      studentId: body.studentId,
      firstName: body.firstName,
      lastName: body.lastName,
    },
  });

  // Return a success response if the student is created successfully
  return NextResponse.json<StudentPostOKResponse>({ ok: true });
};
