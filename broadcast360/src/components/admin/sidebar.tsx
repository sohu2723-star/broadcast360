"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menus=[
    {
        name: "Dashboard",
        path: "/admin"
    },
    {
        name: "Channels",
        path: "/admin/channels"
    },
     {
        name: "Live Streams",
        path: "/admin/streams"
    },
     {
        name: "Movies",
        path: "/admin/movies"
    },
    {
        name: "Series",
        path: "/admin/series"
    },
    {
        name: "News",
        path: "/admin/news"
    },
    {
        name: "Programs",
        path: "/admin/programs"
    },
    {
        name: "Recordings",
        path: "/admin/recordings"
    },
    {
        name: "Users",
        path: "/admin/user"
    },
];

export default function Sidebar(){
    const pathname = usePathname();
return (

<aside className="w-64 min-h-screen bg-[#0B1026] border-r border-white/10 p-5">

<h1 className="text-2xl font-bold mb-10">
<span className="text-[#106EE9]">
Broadcast
</span>
360
</h1>

<nav className="space-y-3">
{
menus.map((menu)=>(

<Link
key={menu.name}
href={menu.path}

className={`
flex
items-center
gap-3
p-3
rounded-xl
transition

${
pathname === menu.path
?
"bg-[#106EE9] text-white"
:
"text-gray-300 hover:bg-[#106EE9]/40"
}

`}
>
<span>
{menu.name}
</span>
</Link>
))
}
</nav>
</aside>

)}