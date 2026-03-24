import { BentoFeatures } from '../components/landing/BentoFeatures'
import { CTA } from '../components/landing/CTA'
import { FAQ } from '../components/landing/FAQ'
import { Footer } from '../components/landing/Footer'
import { Hero } from '../components/landing/Hero'
import { Logos } from '../components/landing/Logos'
import { Navbar } from '../components/landing/Navbar'
import { Pricing } from '../components/landing/Pricing'
import { ProductShowcase } from '../components/landing/ProductShowcase'
import { Testimonials } from '../components/landing/Testimonials'
import { GradientBlob } from '../components/ui/GradientBlob'

type HomePageProps = {
  onPlayNow: () => void
}

function HomePage({ onPlayNow }: HomePageProps) {
  return (
    <div className="relative min-h-[103vh] overflow-x-clip bg-[#05060a] text-white">
      <div className="noise-overlay fixed inset-0 z-0" />
      <GradientBlob color="violet" className="fixed -left-24 top-8 z-0 h-72 w-72 opacity-70 sm:h-96 sm:w-96" />
      <GradientBlob color="blue" className="fixed -right-28 top-20 z-0 h-80 w-80 opacity-60 sm:h-[28rem] sm:w-[28rem]" />
      <GradientBlob color="mixed" className="fixed left-1/3 top-[38rem] z-0 h-64 w-64 opacity-40 sm:h-96 sm:w-96" />

      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero onPrimaryClick={onPlayNow} />
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="section-divider mx-auto max-w-7xl" />
          </div>
          <Logos />
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="section-divider mx-auto max-w-7xl" />
          </div>
          <BentoFeatures />
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="section-divider mx-auto max-w-7xl" />
          </div>
          <ProductShowcase />
          <Testimonials />
          <Pricing />
          <FAQ />
          <CTA onPrimaryClick={onPlayNow} />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default HomePage
