"use client"; 

// import { redirect } from "next/navigation";

// export default function Main() {
//   redirect("/auth/login");
// }

export default function HomePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">Home</h2>
      <p>Welcome to the homepage.</p>
    </div>
  );
}