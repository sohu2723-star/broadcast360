import {NextRequest,NextResponse} from "next/server";
import {StreamService} from "@/services/stream.service";


const service = new StreamService();



export async function GET(
req:NextRequest,
context:{
params:Promise<{id:string}>
}
){

try{


const {id}=await context.params;


const stream =
await service.getById(Number(id));


return NextResponse.json({

success:true,

data:stream

})


}catch(error){


return NextResponse.json(
{
success:false,
message:"Stream not found"
},
{
status:404
}
)


}

}




export async function PATCH(
req:NextRequest,
context:{
params:Promise<{id:string}>
}
){

try{


const {id}=await context.params;


const body=await req.json();


const stream =
await service.update(
Number(id),
body
);



return NextResponse.json({

success:true,

data:stream

})


}catch(error){


console.error(error);


return NextResponse.json(
{
success:false,
message:"Update failed"
},
{
status:500
}
)


}

}




export async function DELETE(
req:NextRequest,
context:{
params:Promise<{id:string}>
}
){

try{


const {id}=await context.params;


await service.delete(
Number(id)
);



return NextResponse.json({

success:true

})


}catch(error){


return NextResponse.json(
{
success:false,
message:"Delete failed"
},
{
status:500
}
)


}

}