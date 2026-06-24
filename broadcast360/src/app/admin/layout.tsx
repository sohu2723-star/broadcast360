import Sidebar from "@/components/admin/sidebar";
import Navbar from "@/components/admin/navbar";

export default function AdminLayout({
 children
}:{
 children:React.ReactNode
}){
return (
<div className="min-h-screen bg-[#010312] text-white flex">

<Sidebar/>
<div className="flex-1">
<Navbar/>

<main className="p-6">
{children}
</main>

</div>
</div>
)}