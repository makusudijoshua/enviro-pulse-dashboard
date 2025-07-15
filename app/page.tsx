import React from "react";
import Container from "@/app/components/layout/Container";
import Dashboard from "@/app/components/sections/Dashboard";

const Page = () => {
  return (
    <div>
      <Container>
        <main>
          <Dashboard />
        </main>
      </Container>
    </div>
  );
};

export default Page;
