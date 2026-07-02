import ProgramForm from "@/components/admin/programs/ProgramForm";
import { fetchChannels } from "@/services/channel.service";
import { fetchProgramById } from "@/services/program.service";


export default async function EditProgramPage({
 params
}:{
 params:Promise<{id:string}>
}){


const {id}=await params;


const program =
await fetchProgramById(Number(id));


const channels =
await fetchChannels();


if(!program){
  return (
    <div>
      Program not found
    </div>
  );
}


return (
  <ProgramForm
    channels={channels}
    mode="edit"
    initialData={program}
  />
);

}