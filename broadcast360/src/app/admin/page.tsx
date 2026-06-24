const stats = [
  {
    title: "Total Channels",
    value: "24",
    icon: "📺",
  },
  {
    title: "Live Streams",
    value: "8",
    icon: "🔴",
  },
  {
    title: "Movies",
    value: "120",
    icon: "🎬",
  },
  {
    title: "Users",
    value: "2,450",
    icon: "👥",
  },
];


export default function DashboardPage(){

return (

<div>


<h1 className="
text-3xl
font-bold
mb-8
">
Dashboard
</h1>



{/* Cards */}

<div className="
grid
grid-cols-4
gap-6
">


{
stats.map(item=>(

<div
key={item.title}
className="
bg-[#0B1026]
rounded-2xl
p-6
border
border-white/10
"
>


<div className="text-3xl">
{item.icon}
</div>


<p className="
text-gray-400
mt-4
">
{item.title}
</p>


<h2 className="
text-4xl
font-bold
mt-2
">
{item.value}
</h2>


</div>


))
}


</div>



{/* Analytics */}

<div className="
grid
grid-cols-2
gap-6
mt-8
">


<div className="
bg-[#0B1026]
rounded-2xl
p-6
h-80
border
border-white/10
">


<h2 className="text-xl font-bold">
Viewer Analytics
</h2>


<div className="
mt-10
text-gray-400
">

📈 Chart Area

</div>


</div>




<div className="
bg-[#0B1026]
rounded-2xl
p-6
border
border-white/10
">


<h2 className="text-xl font-bold">
Live Status
</h2>



<div className="mt-5 space-y-4">


<div className="flex justify-between">
BBC
<span className="text-[#1CFE10]">
● Online
</span>
</div>


<div className="flex justify-between">
CNN
<span className="text-[#F41010]">
● Offline
</span>
</div>


<div className="flex justify-between">
Sports TV
<span className="text-[#1CFE10]">
● Online
</span>
</div>


</div>


</div>


</div>





{/* Recent Activity */}

<div className="
bg-[#0B1026]
rounded-2xl
p-6
mt-8
border
border-white/10
">


<h2 className="text-xl font-bold">
Recent Activity
</h2>


<ul className="
mt-5
space-y-3
text-gray-300
">


<li>
+ Added BBC Channel
</li>

<li>
+ Stream started
</li>

<li>
+ Movie uploaded
</li>


</ul>


</div>



</div>

)

}