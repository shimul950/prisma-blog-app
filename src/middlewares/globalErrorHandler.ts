import { error } from "console";
import { NextFunction, Request, Response } from "express"
import { Prisma } from "../../generated/prisma/client";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;

  //PrismaClientValidationError
  if(err instanceof Prisma.PrismaClientValidationError){
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields";
  }

  //PrismaClientKnownRequestError
  else if(err instanceof Prisma.PrismaClientKnownRequestError){
    if(err.code === 'P2025'){
      statusCode = 400;
      errorMessage = "An operation failed because it depends on one or more records that were required but not found."
    }
    else if(err.code === "P2002"){
      statusCode = 400;
      errorMessage = "Unique constraint failed on the {constraint}"
    }
    else if(err.code === "P2003"){
      statusCode = 400;
      errorMessage = "Foreign key constraint failed on the field: {field_name}"
    }
  }
  //PrismaClientUnknownRequestError
  else if(err instanceof Prisma.PrismaClientUnknownRequestError){
    statusCode = 500;
    errorMessage = "Error occured during query excution"
  }

  // PrismaClientRustPanicError
  else if(err instanceof Prisma.PrismaClientRustPanicError){
    statusCode = 500;
    errorMessage = "This is a non-recoverable error which probably happens when the Prisma Query Engine has a panic."
  }

  //PrismaClientInitializationError
  else if(err instanceof Prisma.PrismaClientInitializationError){
    if(err.errorCode === "P1000"){
      statusCode = 401;
      errorMessage = "Authentication failed against database server"
    }
  }

  res.status(statusCode)
  res.json({
    message: errorMessage,
    error: errorDetails
  })
}

export default errorHandler;
