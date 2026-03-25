import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

export const metadata = {
  title: 'Terms & Conditions | NextStep'
}

export default function TermsConditionsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="mx-auto w-full max-w-4xl px-6 py-20 flex-1">
        <div className="rounded-2xl border border-border/60 bg-card p-8 md:p-12 shadow-soft">
          <h1 className="text-3xl font-bold text-foreground mb-8" style={{ fontFamily: 'var(--font-sans)' }}>
            Terms & Conditions
          </h1>
          
          <div className="space-y-6 text-sm md:text-base text-muted-foreground leading-relaxed">
            <p>Last updated: March 2026</p>
            
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">1. Acceptance of Terms</h2>
              <p>By accessing or using the NextStep platform, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access our services.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">2. Acceptable Use</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">You agree to use NextStep only for lawful purposes. You must not use our platform in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website. Attempting to bypass the platform&apos;s payment architecture is strictly prohibited.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">3. College Information Disclaimer</h2>
              <p>While we strive to keep our college directory (including fees, placements, and accreditation) completely accurate and up-to-date, college policies and fee structures are subject to change by the respective institutions. NextStep is not legally liable for discrepancies between our database and the college's official data. Always verify critical information directly with the institution.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">3. Counselling and Visits</h2>
              <p>Counselling slots and campus visits are subject to availability. Abuse of our booking systems, including scheduling visits without intention to attend, may result in permanent suspension of your account.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">4. User Account Responsibilities</h2>
              <p>You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-foreground mt-8">5. Intellectual Property</h2>
              <p>The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of NextStep and its licensors.</p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
