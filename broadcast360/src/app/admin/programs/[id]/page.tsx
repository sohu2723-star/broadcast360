import ProgramDetails from "@/components/admin/programs/ProgramDetails";


export default async function Page({

params

}:{
params:Promise<{id:string}>

}){

const {id}=await params;

const res =
await fetch(
`${process.env.NEXT_PUBLIC_URL}/api/programs/${id}`,
{
cache:"no-store"
}
);



const result =
await res.json();



return (

<ProgramDetails

program={result.data}

/>

);


}