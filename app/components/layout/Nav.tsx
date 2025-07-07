import React from "react";
import Container from "@/app/components/layout/Container";
import Logo from "@/app/components/layout/Logo";

const Nav = () => {
  return (
    <nav>
      <Container className="py-6 md:py-8 flex flex-row items-center justify-between">
        <Logo />
      </Container>
    </nav>
  );
};

export default Nav;
