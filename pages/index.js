import Head from 'next/head'
import { useState } from 'react';

export default function Home() {
  const [seed, setSeed] = useState(1234);

  function newSeed() {
    setSeed(seed+1);
  }

  return (
    <div>
      <Head>
        <title>GlitchForge Playground</title>
        <meta name="description" content="For illustration purposes only" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <button onClick={newSeed}>New Seed!</button><br/>
        <img src={"/api/sketch?rnd="+seed} />
      </main>
    </div>
  )
}
