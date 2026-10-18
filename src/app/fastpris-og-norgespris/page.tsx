"use client";

import styled from "styled-components";
import Link from "next/link";
import { NORGESPRIS_FASTPRIS_GUIDE } from "@/lib/norgespris-fastpris";

const Section = styled.section`
  padding: 4rem 0;
`;
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 1rem;
  padding: 3rem 2rem;
`;
const Title = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: var(--primary);
`;
const Body = styled.div`
  white-space: pre-wrap;
  line-height: 1.6;
  color: #1f2937;
  font-size: 1.05rem;
`;

export default function FastprisOgNorgespris() {
  return (
    <Section>
      <Container>
        <Title>Fastpris og Norgespris</Title>
        <Body>{NORGESPRIS_FASTPRIS_GUIDE}</Body>
        <p style={{ marginTop: "2rem" }}>
          <Link href="/start-her">Se avtalene som gjelder nå</Link>
        </p>
      </Container>
    </Section>
  );
}
