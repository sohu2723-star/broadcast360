import UserLayout from "@/components/UserLayout";
import "./globals.css";

export default function RootLayout({
children
}:{
children:React.ReactNode
}) {


return (

<html lang="en">

<body>

<UserLayout>

{children}

</UserLayout>


</body>

</html>

)

}