import { NextResponse } from "next/server";
import { addProgram } from "@/services/program.service";
import { createProgramSchema } from "@/lib/validators/program.validator";


export async function POST(
 request:Request
){

try{


const body = await request.json();

const result = createProgramSchema.safeParse(body);

if(!result.success){

 return NextResponse.json(
  {
   errors:result.error.flatten().fieldErrors
  },
  {
   status:400
  }
 );

}

const program = await addProgram(result.data);

return NextResponse.json(
{
 message:"Program created successfully",
 data:program
},

{
 status:201
}

);

}catch(error){

console.log(error);
return NextResponse.json(
{
 message:"Failed to create program"
},
{
 status:500
}
);
}
}