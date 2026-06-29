import { NextResponse } from "next/server";
import { editProgram } from "@/services/program.service";
import { updateProgramSchema } from "@/lib/validators/program.validator";


export async function PUT(
 request:Request,
 {
  params
 }:{
  params:Promise<{id:string}>
 }
){

try{

 const body = await request.json();

 const {id}=await params;


 const result =
 updateProgramSchema.safeParse(body);


 if(!result.success){

 return NextResponse.json(
 {
  errors:
  result.error.flatten().fieldErrors
 },
 {
  status:400
 }
 );

 }


 const program =
 await editProgram(
 Number(id),
 result.data
 );


 return NextResponse.json(
 {
  message:"Program updated successfully",
  data:program
 }
 );


}catch(error){

console.log(error);

return NextResponse.json(
 {
  message:"Failed to update program"
 },
 {
  status:500
 }
)

}

}