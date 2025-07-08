import React from "react";
import Container from "@/app/components/layout/Container";
import Hero from "@/app/components/sections/Hero";
import Dashboard from "@/app/components/sections/Dashboard";

const Page = () => {
  return (
    <div>
      <Container>
        <main>
          <Hero/>
          <Dashboard/>
        </main>
      </Container>
    </div>
  );
};

export default Page;
