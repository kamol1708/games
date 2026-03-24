import personImage from '../assets/IMAGE 2026-02-16 10_48_10.png'

function Hero() {
  return (
    <main className="hero">
      <section className="hero-copy">
        <p className="eyebrow">LET THE GAMES BEGIN</p>
        <h1>
          LET THE
          <br />
          GAMES BEGIN
        </h1>
        <p className="description">
          Raid various dungeons and complete missions to unlock loot and become
          a legendary hero. Play with friends or compete against rivals from
          around the world.
        </p>
        <button className="arcade-btn" type="button">
          PLAY NOW
        </button>
      </section>

      <section className="hero-art">
        <img className="character-image" src={personImage} alt="Smiling game mascot" />
      </section>
    </main>
  )
}

export default Hero
